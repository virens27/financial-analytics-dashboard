import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transactions";
import exportRoutes from "./routes/export";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transactions/export", exportRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });