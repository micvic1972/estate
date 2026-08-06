// 🚀 FIXED: Initialize dotenv at the absolute top before loading your custom routes!
import dotenv from "dotenv"; 
dotenv.config(); 

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";

// 🚀 FIXED: Now these files can boot up safely because your environment variables are already in RAM!
import authroute from "./routes/auth.routes.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.routes.js"; 

const app = express();

// CORS permissions configured before endpoints receive traffic
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Main Authentication Route Configuration
app.use("/api/auth", authroute);
app.use("/api/test", testRoute);
app.use("/api/user", userRoute);

app.listen(8800, () => {
    console.log("Server running perfectly on port 8800...");
});
