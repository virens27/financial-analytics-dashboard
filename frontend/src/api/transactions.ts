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
  const response = await apiClient.get<TransactionsResponse>(
    "/api/transactions",
    {
      params: { limit: 1000, page: 1 },
    },
  );
  return response.data.data;
}

export interface TransactionsQueryParams {
  search?: string;
  category?: string;
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function getTransactions(
  params: TransactionsQueryParams,
): Promise<TransactionsResponse> {
  const response = await apiClient.get<TransactionsResponse>(
    "/api/transactions",
    { params },
  );
  return response.data;
}
