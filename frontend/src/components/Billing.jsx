import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SubscribeButton from "./SubscriptionButton";
import { APIURL } from "../utills/utill";

function Billing() {
  const plans = [
    {
      id: "plan_QqY0rukw9wlrzf",
      title: "Starter Plan",
      duration: "3 Months Access",
      price: "₹2999",
      monthly: "₹500/mo",
      features: [
        "Automates 70–80% of manual work",
        "Generates PDFs instantly",
        "Supports one-click preview and download",
      ],
      badge: "Best for Small Teams",
    },
    {
      id: "plan_QqY2Wa8zKPhmmO",
      title: "Growth Plan",
      duration: "6 Months Access",
      price: "₹5999",
      monthly: "₹416/mo",
      features: [
        "Automates 70–80% of manual work",
        "Generates PDFs instantly",
        "Supports one-click preview and download",
      ],
      badge: "Most Popular",
    },
    {
      id: "plan_QqYLw91PvD09l2",
      title: "Premium Plan",
      duration: "1 Year Access",
      price: "₹10,999",
      monthly: "₹916/mo",
      features: [
        "Automates 70–80% of manual work",
        "Generates PDFs instantly",
        "Supports one-click preview and download",
      ],
      badge: "Best Value",
    },
  ];

  const [hasUsedTrial, setHasUsedTrial] = useState(true);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        const res = await axios.get(`${APIURL}/api/v1/billing/check-free-trial`, {
          withCredentials: true,
        });
        setHasUsedTrial(!res.data.usedTrial);
      } catch (err) {
        console.error("Error checking free trial status", err);
      }
    };
    checkTrial();
  }, []);

  const handleFreeTrial = async () => {
    try {
      const res = await axios.post(
        `${APIURL}/api/v1/billing/free-subscription`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Free trial activated for 30 days!");
        setHasUsedTrial(false);
      } else {
        toast.error(res.data.message || "Failed to activate trial.");
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Error activating trial";
      toast.error(message);
    }
  };

  return (
    <>
      {/* Free Trial Banner */}
      {hasUsedTrial && (
        <div className="max-w-7xl mx-auto bg-blue-100 text-blue-800 p-6 rounded-2xl mb-8 text-center border border-blue-200">
          <h3 className="text-xl font-bold mb-2">Start Your Free Trial!</h3>
          <p className="mb-4">Generate up to 5 PDFs for free.</p>
          <button
            onClick={handleFreeTrial}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Start Free Trial
          </button>
        </div>
      )}

      {/* Paid Plans */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 mb-12">
            Choose a plan that fits your team size and growth.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-3xl shadow p-8 flex flex-col justify-between hover:shadow-lg transition"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.title}</h3>
                  <p className="text-indigo-600 text-sm mb-4">{plan.badge}</p>

                  <div className="text-3xl font-extrabold text-gray-900">{plan.price}</div>
                  <p className="text-gray-700 mb-6">
                    {plan.duration} • {plan.monthly}
                  </p>

                  <ul className="space-y-2 text-sm text-gray-700 mb-8 text-left">
                    {plan.features.map((feat, i) => (
                      <li key={i}>• {feat}</li>
                    ))}
                  </ul>
                </div>

                <SubscribeButton
                  planId={plan.id}
                  amount={parseInt(plan.price.replace(/[₹,]/g, ""))}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Billing;

