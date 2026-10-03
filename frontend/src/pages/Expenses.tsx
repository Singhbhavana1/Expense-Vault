import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Edit,
  Loader2,
  Receipt,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

import ExpenseDialog from "@/components/expenses/ExpenseDialog";

import {
  createExpense,
  deleteExpense,
  getCategories,
  getExpenses,
  updateExpense,
} from "@/services/expense";

import type { Category, Expense } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Loading
  const [loading, setLoading] = useState(true);

  // Delete
  const [deletingExpense, setDeletingExpense] =
    useState<Expense | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);

      const [expenseData, categoryData] = await Promise.all([
        getExpenses(),
        getCategories(),
      ]);

      setExpenses(expenseData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------

  const handleCreateExpense = async (data: {
    title: string;
    amount: string;
    description: string;
    payment_method: Expense["payment_method"];
    expense_date: string;
    category: number | null;
  }) => {
    await createExpense(data);
    await loadData();
    setCurrentPage(1);
  };

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------

  // const handleUpdateExpense = async (data: {
  //   title: string;
  //   amount: string;
  //   description: string;
  //   payment_method: Expense["payment_method"];
  //   expense_date: string;
  //   category: number | null;
  // }) => {
  //   /*
  //    * ExpenseDialog passes the expense through its own edit state.
  //    * This handler is kept compatible with the existing dialog.
  //    *
  //    * The dialog's existing implementation should continue calling
  //    * updateExpense with the correct expense id.
  //    */
  //   console.log("Update expense", data);
  // };

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;

    try {
      setActionLoading(true);

      await deleteExpense(deletingExpense.id);

      setDeletingExpense(null);

      await loadData();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        expense.title.toLowerCase().includes(searchValue) ||
        expense.description?.toLowerCase().includes(searchValue) ||
        expense.category_name?.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        String(expense.category ?? "none") === categoryFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        expense.payment_method === paymentFilter;

      const matchesFromDate =
        !fromDate || expense.expense_date >= fromDate;

      const matchesToDate =
        !toDate || expense.expense_date <= toDate;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPayment &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    expenses,
    search,
    categoryFilter,
    paymentFilter,
    fromDate,
    toDate,
  ]);

  // ---------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE),
  );

  const paginatedExpenses = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredExpenses.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [filteredExpenses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    categoryFilter,
    paymentFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ---------------------------------------------------------
  // FILTER STATE
  // ---------------------------------------------------------

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    paymentFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setPaymentFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const showingFrom =
    filteredExpenses.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const showingTo = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredExpenses.length,
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
            Transactions
          </p>

          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Expenses
          </h1>

          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Track and manage your spending.
          </p>
        </div>

        <ExpenseDialog
          categories={categories}
          onSubmit={handleCreateExpense}
        />
      </div>

      {/* Compact Filters */}
      <Card className="border-border shadow-none">
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-9 border-border bg-background pl-9 text-xs"
              />
            </div>

            {/* Category */}
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value ?? "")}
            >
              <SelectTrigger className="h-9 w-full text-xs sm:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Categories
                </SelectItem>

                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Payment */}
            <Select
              value={paymentFilter}
              onValueChange={(value) => setPaymentFilter(value ?? "")}
            >
              <SelectTrigger className="h-9 w-full text-xs sm:w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Payments
                </SelectItem>

                <SelectItem value="cash">
                  Cash
                </SelectItem>

                <SelectItem value="card">
                  Card
                </SelectItem>

                <SelectItem value="upi">
                  UPI
                </SelectItem>

                <SelectItem value="bank">
                  Bank Transfer
                </SelectItem>

                <SelectItem value="other">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>

            {/* From */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) =>
                  setFromDate(event.target.value)
                }
                className="h-9 w-full pl-9 text-xs sm:w-[145px]"
                aria-label="From date"
              />
            </div>

            {/* To */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) =>
                  setToDate(event.target.value)
                }
                className="h-9 w-full pl-9 text-xs sm:w-[145px]"
                aria-label="To date"
              />
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 shrink-0 px-2.5 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter summary */}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <p className="text-[11px] text-muted-foreground">
              {filteredExpenses.length === 0
                ? "No expenses"
                : `Showing ${showingFrom}-${showingTo} of ${filteredExpenses.length}`}
            </p>

            {hasActiveFilters && (
              <p className="text-[11px] text-primary">
                Filters active
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card className="border-border shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
                <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-foreground">
                {hasActiveFilters
                  ? "No matching expenses"
                  : "No expenses yet"}
              </h3>

              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {hasActiveFilters
                  ? "Try changing your search or filters."
                  : "Add your first expense to start tracking your spending."}
              </p>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table header */}
              <div className="hidden grid-cols-[minmax(0,1fr)_140px_130px_90px] items-center gap-4 border-b border-border bg-muted/30 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                <span>Expense</span>
                <span>Date</span>
                <span>Payment</span>
                <span className="text-right">Amount</span>
              </div>

              <div className="divide-y divide-border">
                {paginatedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="group grid gap-3 px-4 py-3 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1fr)_140px_130px_90px] md:items-center md:gap-4"
                  >
                    {/* Expense */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex">
                        <Receipt className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {expense.title}
                        </p>

                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
                          {expense.category_name && (
                            <>
                              <span className="truncate">
                                {expense.category_name}
                              </span>

                              <span>•</span>
                            </>
                          )}

                          <span className="truncate">
                            {expense.description ||
                              "Expense"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden text-xs text-muted-foreground md:block">
                      {new Date(
                        expense.expense_date,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    {/* Payment */}
                    <div className="hidden md:block">
                      <span className="inline-flex rounded-md bg-muted px-2 py-1 text-[10px] font-medium capitalize text-muted-foreground">
                        {expense.payment_method}
                      </span>
                    </div>

                    {/* Amount + actions */}
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <div className="md:hidden">
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(
                            expense.expense_date,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}

                          {" • "}

                          <span className="capitalize">
                            {expense.payment_method}
                          </span>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <p className="mr-1 text-sm font-semibold text-foreground">
                          ₹
                          {Number(
                            expense.amount,
                          ).toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </p>

                        <ExpenseDialog
                          categories={categories}
                          expense={expense}
                          onSubmit={async (data) => {
                            await updateExpense(
                              expense.id,
                              data,
                            );

                            await loadData();
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label="Edit expense"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label="Delete expense"
                          onClick={() =>
                            setDeletingExpense(expense)
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
                        if (totalPages <= 5) return true;

                        if (currentPage <= 3) {
                          return page <= 5;
                        }

                        if (currentPage >= totalPages - 2) {
                          return page >= totalPages - 4;
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
                          Math.min(totalPages, page + 1),
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
        open={Boolean(deletingExpense)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setDeletingExpense(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this expense?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {deletingExpense?.title}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteExpense}
              disabled={actionLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}