import mongoose from "mongoose";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/sendEmail.js";



const signUp = async (req, res) => {
  try {
    const {userName, email, mobileNumber, password } = req.body;

    if (!email || !userName || !password || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Email, username,Mobile Number and password are required.'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Create user
    const user = await User.create({
      email:email,
      userName:userName,
      password,
      mobileNumber:mobileNumber,
	  generatePdfCount:0
    });

    // JWT payload and token
    const payload = {
      _id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d"
    });

    res
      .status(201)
      .cookie("token", token, {
       httpOnly: true,
       sameSite: "Strict", // or 'Strict'
       maxAge: 365 * 24 * 60 * 60 * 1000
       
  })
      .json({
        success: true,
        message: "User registered successfully.",
        user: {
          _id: user._id,
          email: user.email,
          userName: user.userName,
        },
       
      });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while registering user.",error:error.message
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Validate password (MUST be awaited)
    const valid = await user.isPasswordCorrect(password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Create token
    const payload = {
      _id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    // 4️⃣ Cookie options (pick ONE correct config)
    const cookieOptions = {
      httpOnly: true,
      secure: true,           // required for SameSite=None
      sameSite: "None",       // for cross-site cookies
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    };

    // 5️⃣ Send response
    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        user,
        message: `${user.userName} login successfully`,
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};


const logout = async (req, res) => {
try{
	
	// Check if user exists in User model 
	let  existUser = await User.findByIdAndUpdate(req.user._id);
  
  
	if (!existUser) { 
		// console.log("user not found");
	  return res.status(404).json(404, {}, "User not found");
	} 
	const token = await User.findById(req.user._id).select("token")

	const options = {
        httpOnly: true,
        secure: true
	}
	return res
	  .status(200)
	  .clearCookie("token",token,options)
	  .json(200, {}, "User logged out");
  }
  catch(error){
	return res.status(500).json(error.message);
}};

// get user details
const userDetails=async(req,res)=>{
	try {
		const userId = req.user?._id ; 
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

	const user = await User.findById(userId).select("-password");
	if(!user){
		return res.status(400).json({message:"user not found"})
	}
	return res.status(200).json({
		success:true,
		message:"user details fetched successfully",
		user
	})

	} catch (error) {
	 return res.status(500).json({ message: "Internal server error." ,error:error.message});

	}
}
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body ;
   
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // Always return success to avoid leaking which emails exist
      return res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent"
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP + expiry (5 min)
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family:sans-serif;">
          <h2>Password Reset OTP</h2>
          <p>Your OTP to reset password is:</p>
          <h1 style="font-size:32px; color:#2563eb;">${otp}</h1>
          <p>OTP is valid for <strong>5 minutes</strong>.</p>
        </div>
      `
    });

    return res.status(200)
    .json({
      success: true,
      message: "OTP sent to your email"
      // remove otp in production
      // otp
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error generating reset OTP",
      error: error.message
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required"
      });
    }
     
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP"
      });
    }

    // Validate OTP + expiry
    if (
      user.resetOtp !== otp ||
      !user.resetOtpExpires ||
      user.resetOtpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Update password (hashed via pre-save hook)
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message
    });
  }
};

export{
	signUp,
	login,
	logout,
	userDetails,
	requestPasswordReset,
	resetPassword
}
