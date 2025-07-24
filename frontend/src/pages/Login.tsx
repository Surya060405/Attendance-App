import  { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_BACKEND_URL;


const Login = () => {
  
  const navigate = useNavigate() ;
  const [user, setUser] = useState({ enrollmentId: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
       setUser({ ...user, [e.target.name]: e.target.value });
  }

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try{
       const response = await fetch(`${API}/login` , {
      method: "POST" ,
      headers: {
        "Content-Type" : "application/json" ,
      },
      body:JSON.stringify(user) ,
      credentials: "include", 
      
    })

    const data = await response.json();
    const message = data.message 
  

    if(response.ok){
       
      if( message.toLowerCase().includes("login")){
        navigate('/mark-attendance') ;
      }

    }
    else{
        alert("Registration Failed : " + data.message) ;
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
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">Login</h2>

        <input
          type="text"
          placeholder="Enrollment ID"
          name="enrollmentId"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-zinc-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={user.enrollmentId}
          onChange= {handleChange}
          required
        />

        <input
          type="password"
          placeholder="Password"
          name="password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-zinc-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={user.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg transition duration-200"
        >
          Login
        </button>

        <p className="text-sm text-center mt-4 text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Login;
