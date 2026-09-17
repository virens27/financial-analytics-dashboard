import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { getTransactions, type Transaction } from "../api/transactions";

type SortField = "date" | "amount" | "category" | "status" | "userId";

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, dateFrom, dateTo, amountMin, amountMax, sortBy, sortOrder, page, limit]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const response = await getTransactions({
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        amountMin: amountMin ? Number(amountMin) : undefined,
        amountMax: amountMax ? Number(amountMax) : undefined,
        sortBy,
        sortOrder,
        page: page + 1,
        limit,
      });
      setTransactions(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(0);
  }

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Transactions
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Search"
              fullWidth
              size="small"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              select
              label="Category"
              fullWidth
              size="small"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Revenue">Revenue</MenuItem>
              <MenuItem value="Expense">Expense</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              select
              label="Status"
              fullWidth
              size="small"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 2.5 }}>
            <TextField
              label="From date"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.5 }}>
            <TextField
              label="To date"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              label="Min amount"
              type="number"
              fullWidth
              size="small"
              value={amountMin}
              onChange={(e) => { setAmountMin(e.target.value); setPage(0); }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              label="Max amount"
              type="number"
              fullWidth
              size="small"
              value={amountMax}
              onChange={(e) => { setAmountMax(e.target.value); setPage(0); }}
            />
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel active={sortBy === "date"} direction={sortBy === "date" ? sortOrder : "asc"} onClick={() => handleSort("date")}>
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortBy === "amount"} direction={sortBy === "amount" ? sortOrder : "asc"} onClick={() => handleSort("amount")}>
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortBy === "category"} direction={sortBy === "category" ? sortOrder : "asc"} onClick={() => handleSort("category")}>
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortBy === "status"} direction={sortBy === "status" ? sortOrder : "asc"} onClick={() => handleSort("status")}>
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortBy === "userId"} direction={sortBy === "userId" ? sortOrder : "asc"} onClick={() => handleSort("userId")}>
                    User
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No transactions found</TableCell></TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell>${t.amount.toLocaleString()}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>
                      <Chip label={t.status} size="small" color={t.status === "Paid" ? "success" : "warning"} />
                    </TableCell>
                    <TableCell>{t.userId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </CardContent>
    </Card>
  );
}