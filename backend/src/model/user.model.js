import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
const userSchema=new Schema({
	userName:{
		type:String,
		unique:true,
		required:true
	},
	email:{
	 type:String,
	 required:true,
	 unique:true,
	 trim:true
	},
	mobileNumber:{
		type:String,
		required:true,
		unique:true
	},
	password:{
		type:String,
		required:true
	},
	generatePdfCount:{
		type:Number,
		default:0
	},
	 resetOtp: { type: String },
     resetOtpExpires: { type: Date }
},
{
	timestamps:true
})

userSchema.pre("save",async function (next) {
	if(!this.isModified("password")){
		return next();
	}
	this.password=await bcrypt.hash(this.password,10);
	next()
	
})

userSchema.methods.isPasswordCorrect=async function(password) {
	const result=await bcrypt.compare(password,this.password)
	return result;
	
}

export const User=mongoose.model("User",userSchema)
