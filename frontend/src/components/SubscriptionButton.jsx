import { APIURL } from "../utills/utill.js";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SubscribeButton = ({ planId, amount }) => {
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    // try {
    //     toast("Only super admins can subscribe. Please create an organization first.");
    //     navigate("/create-organization");
    //     return;
    //   }

    //   const { data } = await axios.post(
    //     `${APIURL}/api/v1/billing/create-order`,
    //     {  planId, amount },
    //     {
    //       headers: { "Content-Type": "application/json" },
    //       withCredentials: true,
    //     }
    //   );

    //   if (!data?.orderId) {
    //     toast.error("Order creation failed");
    //     return;
    //   }

    //   const options = {
    //     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    //     amount: amount * 100,
    //     currency: "INR",
    //     name: "Teamlify",
    //     description: "Subscription Payment",
    //     order_id: data.orderId,
    //     handler: function (response) {
    //       toast.success("Payment successful!");
    //     },
    //     prefill: {
    //       email: localStorage.getItem("userEmail") || "",
    //     },
    //     theme: { color: "#1d4ed8" },
    //   };

    //   const razorpay = new window.Razorpay(options);
    //   razorpay.open();
    // } catch (err) {
    //   toast.error("Payment failed");
    // }
  };

  return (
   <button
  onClick={handleSubscribe}
  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-2xl font-semibold shadow-md transition transform hover:scale-105"
>
  Subscribe Now
</button>

  );
};


export default SubscribeButton;
