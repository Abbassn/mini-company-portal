import "./config/env.js";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Mini Company Portal API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK"
  });
});

export default app;