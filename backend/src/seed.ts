import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Transaction from "./models/Transaction";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env file");
  process.exit(1);
}

interface RawTransaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB for seeding");

  const filePath = path.join(__dirname, "data", "transactions.json");
  const raw: RawTransaction[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  await Transaction.deleteMany({});
  console.log("Cleared existing transactions");

  const docs = raw.map((t) => ({
    transactionId: t.id,
    date: new Date(t.date),
    amount: t.amount,
    category: t.category,
    status: t.status,
    userId: t.user_id,
    userProfile: t.user_profile,
  }));

  await Transaction.insertMany(docs);
  console.log(`Inserted ${docs.length} transactions`);

  await mongoose.disconnect();
  console.log("Done seeding, disconnected");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});