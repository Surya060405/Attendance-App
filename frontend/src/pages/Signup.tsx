import  { useState } from "react";
import { Link , useNavigate} from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {

  const [user, setUser] = useState({ name: "", enrollmentId: "", password: "" });
  const navigate = useNavigate() ;

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try{
       const response = await fetch(`http://localhost:3000/register` , {
      method: "POST" ,
      headers: {
        "Content-Type" : "application/json" ,
      },
      body:JSON.stringify(user) ,
      credentials: "include", 
    })

    let data = await response.json() ;
    const message = data.message ;
    

      if (response.ok && message.toLowerCase().includes("registered")) {
       navigate('/mark-attendance')
        // or navigate("/success") if you have a separate success page
      } else {
        alert("Registration failed: " + data);
      }
    }
    catch(error){
        console.log(error) ;
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-zinc-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">Sign Up</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-zinc-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={user.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="enrollmentId"
          placeholder="Enrollment ID"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-zinc-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={user.enrollmentId}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-zinc-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={user.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg transition duration-200"
        >
          Create Account
        </button>

        <p className="text-sm text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Signup;
