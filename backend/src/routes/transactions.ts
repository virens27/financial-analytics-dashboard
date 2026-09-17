import { Router, Response } from "express";
import Transaction from "../models/Transaction";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { buildTransactionFilter } from "../utils/buildTransactionFilter";

const router = Router();

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      sortBy = "date",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const filter = buildTransactionFilter(req.query);

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortBy as string]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export default router;