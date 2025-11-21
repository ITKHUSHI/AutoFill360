import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fileRouter from "./routes/file.route.js"
import userRouter from "./routes/user.route.js"
import { connectDB } from './db/index.js';
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;
 
const whitelist = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173"


];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use("/output", express.static(path.join(__dirname, "output")));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", true);

app.use("/api/files",fileRouter)
app.use("/api/user",userRouter)

connectDB()
.then(()=>{
  app.listen(PORT,"0.0.0.0" ,() => {
  console.log(`Server is running on port ${PORT}`);
})
}).catch((err)=>{
  throw new Error("Mongo db Connection faild !!!",err);
})
