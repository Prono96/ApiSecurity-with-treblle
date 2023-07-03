import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import logger from "./log/logger.js";
import connectDB from "./config/database.js";
import helmet from "helmet";
import bodyParser from "body-parser";
import treblle from "@treblle/express";
import authRoutes from "./app/routes/authRoute.js";
import userRoutes from "./app/routes/userRoute.js";
import storeRoutes from "./app/routes/storeRoute.js";
import productRoutes from "./app/routes/productRoute.js";

const app = express();
connectDB();

// Middleware
app.use(helmet());
app.use(setXFrameOptionsHeader);
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Set security headers middleware
app.use((req, res, next) => {
  // Content-Security-Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' https:; upgrade-insecure-requests"
  );

  // X-Frame-Options
  res.setHeader("X-Frame-Options", "DENY");

  // Referrer-Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // X-Content-Type-Options
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-XSS-Protection
  res.setHeader("X-XSS-Protection", "0");

  // Strict-Transport-Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=15552000; includeSubDomains"
  );

  // Access-Control-Allow-Origin
  // res.setHeader("Access-Control-Allow-Origin", "https://your-domain.com");

  next();
});

// Monitoring with Treblle Middleware
app.use(
  treblle({
    apiKey: process.env.TREBLLE_API_KEY,
    projectId: process.env.TREBLLE_PROJECT_ID,
  })
);

let PORT = process.env.PORT;

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/store", storeRoutes);
app.use("/product", productRoutes);

// Start the server
app.listen(PORT, () => logger.info(`APP Started on Port --- ${PORT}`));
