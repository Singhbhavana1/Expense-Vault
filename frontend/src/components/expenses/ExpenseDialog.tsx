import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Category, Expense } from "@/types";

interface ExpenseDialogProps {
  categories: Category[];
  expense?: Expense | null;
  onSubmit: (data: {
    title: string;
    amount: string;
    description: string;
    payment_method: Expense["payment_method"];
    expense_date: string;
    category: number | null;
  }) => Promise<void>;
  trigger?: React.ReactNode;
}

export default function ExpenseDialog({
  categories,
  expense,
  onSubmit,
  trigger,
}: ExpenseDialogProps) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<Expense["payment_method"]>("cash");
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState<string>("none");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount);
      setDescription(expense.description);
      setPaymentMethod(expense.payment_method);
      setExpenseDate(expense.expense_date);
      setCategory(expense.category ? String(expense.category) : "none");
    } else {
      setTitle("");
      setAmount("");
      setDescription("");
      setPaymentMethod("cash");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setCategory("none");
    }

    setError("");
  }, [expense, open]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDescription("");
    setPaymentMethod("cash");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setCategory("none");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter an expense title.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!expenseDate) {
      setError("Please select a date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSubmit({
        title: title.trim(),
        amount,
        description: description.trim(),
        payment_method: paymentMethod,
        expense_date: expenseDate,
        category: category === "none" ? null : Number(category),
      });

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(expense);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Expense Title</Label>
            <Input
              id="title"
              placeholder="e.g. Grocery shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>

                  {categories.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>

              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as Expense["payment_method"])
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>

            <Input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              placeholder="Add some details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 rounded-xl resize-none"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="rounded-xl"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Expense"
                  : "Save Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}