import mongoose from "mongoose"

const connectDB=async()=>{
	try {
	  const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}`)
	  console.log("sucessfuly connect mongodb");
	} catch (error) {
		console.log("error while connect mongodb ",error)
		process.exit(1)
	}
}

export {connectDB}