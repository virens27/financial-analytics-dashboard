import apiClient from "./client";

export interface Transaction {
  _id: string;
  transactionId: number;
  date: string;
  amount: number;
  category: "Revenue" | "Expense";
  status: "Paid" | "Pending";
  userId: string;
  userProfile?: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<TransactionsResponse>("/api/transactions", {
    params: { limit: 1000, page: 1 },
  });
  return response.data.data;
}