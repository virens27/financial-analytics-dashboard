import { Router, Response } from "express";
import Transaction from "../models/Transaction";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      category,
      status,
      userId,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      sortBy = "date",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const filter: any = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter.userId = { $regex: userId as string, $options: "i" };

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
      if (dateTo) filter.date.$lte = new Date(dateTo as string);
    }

    if (amountMin || amountMax) {
      filter.amount = {};
      if (amountMin) filter.amount.$gte = Number(amountMin);
      if (amountMax) filter.amount.$lte = Number(amountMax);
    }

    if (search) {
      const searchRegex = { $regex: search as string, $options: "i" };
      filter.$or = [{ userId: searchRegex }, { category: searchRegex }, { status: searchRegex }];
    }

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