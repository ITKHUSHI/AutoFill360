import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fileRouter from "./routes/file.route.js"


const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;
 
const whitelist = [
  process.env.CORS_ORIGIN,

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/files",fileRouter)

app.listen(PORT,"0.0.0.0" ,() => {
  console.log(`Server is running on port ${PORT}`);
})