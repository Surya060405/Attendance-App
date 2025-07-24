import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getDistance } from 'geolib';
const API = import.meta.env.VITE_BACKEND_URL;

const Attendance = () => {
  const [user, setUser] = useState({
    name: '',
    enrollmentId: ''
  });

  const [loading,setLoading] = useState(false) ;

const EDC_COORDS = {
  latitude: 22.55636035093532,  // EDC Latitude
  longitude: 88.30763204870807  // EDC Longitude

   
};


  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn , setIsLoggedIn] = useState(false) ;

  const handleChange = (e: any) => {
    setUser(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

const checkLoggedIn = async () => {
  try {
    const response = await fetch(`${API}/auth/check`, {
      credentials: 'include',
    });

    const data = await response.json();
    if (data.loggedIn) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  } catch (err) {
    setIsLoggedIn(false);
  }
};

  
 useEffect(() => {
  checkLoggedIn();
}, []);

  
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  setSuccess('');
   setLoading(true);
  // Prevent submitting if already empty
  if (!user.name.trim() || !user.enrollmentId.trim()) {
    setError("Please fill in all fields.");
    return;
  }

  // Step 1: Get location
  if (!navigator.geolocation) {
    setLoading(false) ;
    setError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const userLatitude = position.coords.latitude;
      const userLongitude = position.coords.longitude;

      const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        EDC_COORDS
      );

     

      if (distance > 300) {
        setLoading(false) ;
        setError("Access denied. You must be within 10 meters of EDC to mark attendance.");
        return;
      }

      try {
        // Step 2: Check backend auth
        const res = await fetch('http://localhost:3000/mark-attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) {
          setLoading(false) ;
          setError(data.message || "Server error.");
          return;
        }

        // Step 3: Submit to Google Sheet
        const sheetUrl = "https://script.google.com/macros/s/AKfycby78w-_RAfjeUNWiH0IGK-pC0fYMwz4qnRG98NbWYyNZO2WtKGwNiir1sxiKghzHTI6/exec";
        const formData = new URLSearchParams();
        formData.append('Name', user.name.trim());
        formData.append('EnrollmentID', user.enrollmentId.trim());

        const sheetRes = await fetch(sheetUrl, {
          method: "POST",
          body: formData,
        });

        const sheetData = await sheetRes.json();

        if (sheetData.result === "success") {
          setLoading(false) ;
          setSuccess(sheetData.message);
          setUser({ name: '', enrollmentId: '' });
        } else {
          setLoading(false) ;
          setError("Failed to mark attendance in sheet.");
        }

      } catch (err) {
        setLoading(false) ;
        setError("Unexpected error occurred.");
      }
    },
    (geoError) => {
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          setLoading(false) ;
          setError(" Please allow location access to mark attendance.");
          break;
        case geoError.POSITION_UNAVAILABLE:
          setLoading(false) ;
          setError(" Location information unavailable.");
          break;
        case geoError.TIMEOUT:
          setLoading(false) ;
          setError(" Location request timed out.");
          break;
        
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};


  return (
    <div className="min-h-screen bg-zinc-800 text-white relative px-4 py-4">
      {/* Header with Login Button */}
      {isLoggedIn === false ? <div className="flex justify-end items-center mb-6">
        <Link
          to="/login"
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          Login
        </Link>
      </div> : <div></div>
      }

      {/* Main Card */}
      <div className="flex justify-center items-center">
        <div className="max-w-md w-full bg-zinc-900 shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">
            📋 Mark Attendance
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-300 font-medium">Name</label>
              <input
                type="text"
                name="name"
                required
                value={user.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 font-medium">Enrollment ID</label>
              <input
                type="text"
                name="enrollmentId"
                required
                value={user.enrollmentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="2023ITB023"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition-all"
            >
              Mark Your Attendance
            </button>
          </form>

          {loading && (
  <div className="flex items-center justify-center mt-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-2">Marking attendance...</span>
  </div>
)}

          {success && (
            <p className="text-green-400 mt-4 text-center font-medium">{success}</p>
          )}
          {error && (
            <p className="text-red-400 mt-4 text-center font-medium">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
