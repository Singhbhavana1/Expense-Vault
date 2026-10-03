import { useEffect, useMemo, useState } from "react";

import {
  ArrowDownLeft,
  CalendarDays,
  IndianRupee,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
  type Income,
  type IncomePayload,
  type IncomeType,
} from "@/services/income";

const ITEMS_PER_PAGE = 10;

const incomeTypes: {
  value: IncomeType;
  label: string;
}[] = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "bonus", label: "Bonus" },
  { value: "interest", label: "Interest" },
  { value: "other", label: "Other" },
];

const emptyForm: IncomePayload = {
  title: "",
  amount: "",
  income_type: "salary",
  description: "",
  income_date: new Date().toISOString().split("T")[0],
};

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function IncomeDialog({
  income,
  onSaved,
  trigger,
}: {
  income?: Income | null;
  onSaved: () => Promise<void>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IncomePayload>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (income) {
      setForm({
        title: income.title,
        amount: income.amount,
        income_type: income.income_type,
        description: income.description,
        income_date: income.income_date,
      });
    } else {
      setForm({
        ...emptyForm,
        income_date: new Date().toISOString().split("T")[0],
      });
    }

    setError("");
  }, [income, open]);

  const updateField = <K extends keyof IncomePayload>(
    field: K,
    value: IncomePayload[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter an income title.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.income_date) {
      setError("Please select a date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (income) {
        await updateIncome(income.id, {
          ...form,
          title: form.title.trim(),
        });
      } else {
        await createIncome({
          ...form,
          title: form.title.trim(),
        });
      }

      await onSaved();
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("Unable to save income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
     <DialogTrigger
  render={
    trigger ?? (
      <Button size="sm">
        <Plus className="h-4 w-4" />
        Add Income
      </Button>
    )
  }
/>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {income ? "Edit Income" : "Add Income"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="income-title">Income source</Label>

            <Input
              id="income-title"
              placeholder="e.g. Monthly Salary"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income-amount">Amount</Label>

            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="income-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="80,000"
                value={form.amount}
                onChange={(event) =>
                  updateField("amount", event.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Income type</Label>

              <Select
                value={form.income_type}
                onValueChange={(value) =>
                  updateField(
                    "income_type",
                    value as IncomeType,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {incomeTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="income-date">Date</Label>

              <Input
                id="income-date"
                type="date"
                value={form.income_date}
                onChange={(event) =>
                  updateField(
                    "income_date",
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income-description">
              Description
            </Label>

            <Input
              id="income-description"
              placeholder="Optional"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : income
                  ? "Update Income"
                  : "Save Income"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Income() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Income | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getIncomes();

      setIncomes(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load income.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  // ---------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------

  const totalIncome = useMemo(
    () =>
      incomes.reduce(
        (total, income) =>
          total + Number(income.amount),
        0,
      ),
    [incomes],
  );

  const monthlyIncome = useMemo(() => {
    const now = new Date();

    return incomes
      .filter((income) => {
        const date = new Date(income.income_date);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (total, income) =>
          total + Number(income.amount),
        0,
      );
  }, [incomes]);

  const salaryIncome = useMemo(
    () =>
      incomes
        .filter(
          (income) =>
            income.income_type === "salary",
        )
        .reduce(
          (total, income) =>
            total + Number(income.amount),
          0,
        ),
    [incomes],
  );

  // ---------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(incomes.length / ITEMS_PER_PAGE),
  );

  const paginatedIncomes = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return incomes.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [incomes, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteIncome(deleteTarget.id);

      setDeleteTarget(null);

      await loadIncomes();
    } catch (err) {
      console.error(err);
      setError("Unable to delete income.");
    } finally {
      setDeleting(false);
    }
  };

  const showingFrom =
    incomes.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const showingTo = Math.min(
    currentPage * ITEMS_PER_PAGE,
    incomes.length,
  );

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Money In
          </p>

          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Income
          </h1>

          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Track your salary and other income sources.
          </p>
        </div>

        <IncomeDialog
          onSaved={loadIncomes}
          trigger={
            <Button
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          }
        />
      </div>

      {/* Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Total */}
        <Card className="border-border shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Wallet className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Total income
              </p>

              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card className="border-border shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                This month
              </p>

              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Salary */}
        <Card className="border-border shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Salary income
              </p>

              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {formatCurrency(salaryIncome)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Income list */}
      <Card className="border-border shadow-none">
        <CardContent className="p-0">
          {/* List header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Income sources
              </h2>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {incomes.length}{" "}
                {incomes.length === 1
                  ? "record"
                  : "records"}
              </p>
            </div>

            {incomes.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {showingFrom}-{showingTo} of{" "}
                {incomes.length}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
              Loading income...
            </div>
          ) : incomes.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-foreground">
                No income added yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                Add your salary or another income source
                to unlock balance and savings calculations.
              </p>

              <div className="mt-4">
                <IncomeDialog
                  onSaved={loadIncomes}
                  trigger={
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      Add your first income
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden grid-cols-[minmax(0,1fr)_150px_130px_100px] items-center gap-4 border-b border-border bg-muted/30 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                <span>Income source</span>
                <span>Type</span>
                <span>Date</span>
                <span className="text-right">
                  Amount
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {paginatedIncomes.map((income) => (
                  <div
                    key={income.id}
                    className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1fr)_150px_130px_100px] md:items-center md:gap-4"
                  >
                    {/* Source */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 sm:flex">
                        <ArrowDownLeft className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {income.title}
                        </p>

                        {income.description && (
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
                            {income.description}
                          </p>
                        )}

                        {/* Mobile metadata */}
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground md:hidden">
                          <span>
                            {income.income_type_display}
                          </span>

                          <span>•</span>

                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />

                            {new Date(
                              income.income_date,
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="hidden md:block">
                      <span className="inline-flex rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                        {income.income_type_display}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="hidden text-xs text-muted-foreground md:block">
                      {new Date(
                        income.income_date,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    {/* Amount + actions */}
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(income.amount)}
                      </p>

                      <div className="flex items-center gap-1">
                        <IncomeDialog
                          income={income}
                          onSaved={loadIncomes}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label="Edit income"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label="Delete income"
                          onClick={() =>
                            setDeleteTarget(income)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1),
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    )
                      .filter((page) => {
                        if (totalPages <= 5) {
                          return true;
                        }

                        if (currentPage <= 3) {
                          return page <= 5;
                        }

                        if (
                          currentPage >=
                          totalPages - 2
                        ) {
                          return (
                            page >= totalPages - 4
                          );
                        }

                        return (
                          page >= currentPage - 2 &&
                          page <= currentPage + 2
                        );
                      })
                      .map((page) => (
                        <Button
                          key={page}
                          variant={
                            currentPage === page
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="h-8 min-w-8 px-2 text-xs"
                          onClick={() =>
                            setCurrentPage(page)
                          }
                        >
                          {page}
                        </Button>
                      ))}

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(
                            totalPages,
                            page + 1,
                          ),
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this income?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong className="text-foreground">
                {deleteTarget?.title}
              </strong>{" "}
              from your income records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}