import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { APIURL } from "../utills/utill.js";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${APIURL}/api/user/profile`, {
		
	    	headers:{
           "Content-Type": "application/json"
           },
		  
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        toast.error("Failed to fetch user profile",err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  if(user) localStorage.setItem("isLoggedIn",true)
  else localStorage.setItem("isLoggedIn",false)
  if (loading) return <p className="text-gray-600">Loading profile...</p>;
  if (!user) return <p className="text-red-500">No user data found.</p>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">User Profile</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">UserName:</span>
          <span className="text-gray-900">{user.userName || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Email:</span>
          <span className="text-gray-900">{user.email || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Mobile:</span>
          <span className="text-gray-900">{user.mobileNumber || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Generated PDFs:</span>
          <span className="text-gray-900">{user.generatePdfCount || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">join Since:</span>
          <span className="text-gray-900">{ Date(user.createdAt) || 0}</span>
        </div>
      </div>
    </div>
  );
}
