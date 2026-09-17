import { Router, Response } from "express";
import { stringify } from "csv-stringify/sync";
import Transaction from "../models/Transaction";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { buildTransactionFilter } from "../utils/buildTransactionFilter";

const router = Router();

const ALLOWED_COLUMNS = ["transactionId", "date", "amount", "category", "status", "userId", "userProfile"];

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { columns } = req.query;

    if (!columns || typeof columns !== "string") {
      return res.status(400).json({ error: "columns query parameter is required (comma-separated field names)" });
    }

    const requestedColumns = columns.split(",").map((c) => c.trim());
    const invalidColumns = requestedColumns.filter((c) => !ALLOWED_COLUMNS.includes(c));

    if (invalidColumns.length > 0) {
      return res.status(400).json({ error: `Invalid column(s): ${invalidColumns.join(", ")}` });
    }

    const filter = buildTransactionFilter(req.query);
    const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();

    const rows = transactions.map((t: any) => {
      const row: Record<string, any> = {};
      requestedColumns.forEach((col) => {
        row[col] = col === "date" ? new Date(t[col]).toISOString().split("T")[0] : t[col];
      });
      return row;
    });

    const csv = stringify(rows, { header: true, columns: requestedColumns });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="transactions-export.csv"');
    res.send(csv);
  } catch (err) {
    console.error("Error exporting transactions:", err);
    res.status(500).json({ error: "Failed to export transactions" });
  }
});

export default router;