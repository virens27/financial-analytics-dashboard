import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAllTransactions, type Transaction } from "../api/transactions";
import TransactionsTable from "../components/TransactionsTable";
import ExportModal from "../components/ExportModal";

const COLORS = { Revenue: "#2e7d32", Expense: "#c62828" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllTransactions();
        setTransactions(data);
      } catch (err) {
        setError("Failed to load transaction data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const totalRevenue = transactions
    .filter((t) => t.category === "Revenue")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.category === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalRevenue - totalExpenses;

  const categoryBreakdown = [
    { name: "Revenue", value: totalRevenue },
    { name: "Expense", value: totalExpenses },
  ];

  const monthlyMap: Record<string, { month: string; Revenue: number; Expense: number }> = {};

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, Revenue: 0, Expense: 0 };
    }
    monthlyMap[monthKey][t.category] += t.amount;
  });

  const trendData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={() => setExportOpen(true)}>
            Export CSV
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Log Out
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" sx={{ color: COLORS.Revenue }}>
                ${totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h5" sx={{ color: COLORS.Expense }}>
                ${totalExpenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Net Balance
              </Typography>
              <Typography variant="h5" sx={{ color: netBalance >= 0 ? COLORS.Revenue : COLORS.Expense }}>
                ${netBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue vs Expenses Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Revenue" stroke={COLORS.Revenue} />
                  <Line type="monotone" dataKey="Expense" stroke={COLORS.Expense} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name as "Revenue" | "Expense"]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TransactionsTable />

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </Box>
  );
}