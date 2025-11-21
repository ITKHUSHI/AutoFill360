import { useState } from "react";
import { APIURL } from "../utills/utill.js";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
   const navigate=useNavigate()

  const handleLogin = async (e) => {
     try {
		e.preventDefault()
		const res=axios.post(`${APIURL}/api/user/login`,form,{
			withCredentials:true
		})
		navigate("/")
		toast.success("Login  successfully")
	} catch (error) {
		toast.error("Login faild",error.message)
	}
  };

  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Login</h2>

        <form className="space-y-4" onSubmit={handleLogin}>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Don't have an account?
          <a href="/signup" className="text-blue-600 ml-1">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
