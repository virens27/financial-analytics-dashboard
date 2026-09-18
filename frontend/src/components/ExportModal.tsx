import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
} from "@mui/material";
import { exportTransactionsCSV } from "../api/transactions";

const COLUMN_OPTIONS = [
  { key: "transactionId", label: "Transaction ID" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "userId", label: "User" },
  { key: "userProfile", label: "User Profile URL" },
];

const DEFAULT_SELECTED = ["transactionId", "date", "amount", "category", "status", "userId"];

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  function toggleColumn(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  }

  async function handleExport() {
    if (selected.length === 0) {
      setError("Select at least one column");
      return;
    }
    setExporting(true);
    setError("");
    try {
      const blob = await exportTransactionsCSV(selected);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transactions-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Export Transactions to CSV</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormGroup>
          {COLUMN_OPTIONS.map((col) => (
            <FormControlLabel
              key={col.key}
              control={<Checkbox checked={selected.includes(col.key)} onChange={() => toggleColumn(col.key)} />}
              label={col.label}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}