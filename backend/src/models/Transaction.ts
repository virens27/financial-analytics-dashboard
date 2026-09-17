import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  transactionId: number;
  date: Date;
  amount: number;
  category: "Revenue" | "Expense";
  status: "Paid" | "Pending";
  userId: string;
  userProfile: string;
}

const transactionSchema = new Schema<ITransaction>({
  transactionId: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["Revenue", "Expense"], required: true },
  status: { type: String, enum: ["Paid", "Pending"], required: true },
  userId: { type: String, required: true },
  userProfile: { type: String },
});

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
