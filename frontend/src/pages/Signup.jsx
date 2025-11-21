import { useState } from "react";
import axios from "axios"
import toast from "react-hot-toast"
import {APIURL} from "../utills/utill.js"
import { useNavigate } from "react-router";
const Signup = () => {
	const navigate=useNavigate()
  const [form, setForm] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    password: ""
  });

  const handleSignup = async (e) => {
    try {
		e.preventDefault()
		const res=axios.post(`${APIURL}/api/user/sign-up`,form,{
			withCredentials:true
		})
		navigate("/")
		toast.success("user sign up successfully")
	} catch (error) {
		toast.error("sign up faild",error.message)
	}

  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

        <form className="space-y-4" onSubmit={handleSignup}>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

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
            <label className="text-sm font-medium">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
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
            Sign Up
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Already have an account?
          <a href="/login" className="text-blue-600 ml-1">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
