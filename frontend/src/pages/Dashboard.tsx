import { useEffect, useMemo, useState } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { getCategories, getDashboard } from "@/services/expense";

import type {
  Category,
  DashboardData,
} from "@/types";

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatCompactCurrency(value: string | number) {
  const amount = Number(value);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return formatCurrency(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getMonthName() {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, categoryData] = await Promise.all([
        getDashboard(),
        getCategories(),
      ]);

      setDashboard(dashboardData);
      setCategories(categoryData);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const monthlyIncome = Number(dashboard?.monthly_income ?? 0);

  const monthlyExpense = Number(dashboard?.monthly_expense ?? 0);

  const monthlySavings = Number(dashboard?.monthly_savings ?? 0);

  const savingsRate =
    dashboard?.savings_rate !== null &&
    dashboard?.savings_rate !== undefined
      ? Number(dashboard.savings_rate)
      : null;

  const incomeSet = Boolean(dashboard?.income_set);

  const balance = incomeSet
    ? monthlyIncome - monthlyExpense
    : null;

  const spendingPercentage =
    monthlyIncome > 0
      ? Math.min((monthlyExpense / monthlyIncome) * 100, 100)
      : 0;

  const trendData = useMemo(() => {
    return (
      dashboard?.expense_trend?.map((item) => ({
        date: formatDate(item.date),
        amount: Number(item.total),
      })) ?? []
    );
  }, [dashboard]);

  const topCategories = useMemo(() => {
    return dashboard?.category_expenses?.slice(0, 5) ?? [];
  }, [dashboard]);

  const maxCategoryAmount = Math.max(
    ...topCategories.map((item) => Number(item.total)),
    1,
  );

  /*
   * categories is loaded here because the existing dashboard API
   * already returns category information separately.
   *
   * This keeps the existing API behavior intact.
   */
  void categories;

  if (loading) {
    return (
      <div className="w-full min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-7 w-44 animate-pulse rounded bg-muted" />
          </div>

          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>

        <div className="h-24 animate-pulse rounded-lg bg-muted" />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-lg bg-muted lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Overview
          </p>

          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Your finances
          </h1>

          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Here's how your money looks this month.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{getMonthName()}</span>
        </div>
      </div>

      {/* Income setup */}
      {!incomeSet && (
        <Card className="border-blue-200 bg-card dark:border-blue-900/60">
          <CardContent className="flex flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Wallet className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Set up your income
                </p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Add your income to calculate your actual balance and savings.
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              className="shrink-0"
              onClick={() => {
                window.location.href = "/income";
              }}
            >
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main metrics */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Income */}
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Income
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
                  {incomeSet
                    ? formatCurrency(monthlyIncome)
                    : "Not set"}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Money coming in
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Spent
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(monthlyExpense)}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              {dashboard.total_transactions} total transactions
            </div>
          </CardContent>
        </Card>

        {/* Savings */}
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Savings
                </p>

                <p
                  className={`mt-1.5 text-xl font-semibold tracking-tight ${
                    incomeSet && monthlySavings < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                  }`}
                >
                  {incomeSet
                    ? formatCurrency(monthlySavings)
                    : "—"}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <CircleDollarSign className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 text-[11px] text-muted-foreground">
              {incomeSet && savingsRate !== null
                ? `${savingsRate.toFixed(1)}% savings rate`
                : "Add income to calculate"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available balance */}
      <Card className="border-border bg-card shadow-none">
        <CardContent className="px-4 py-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Available balance
              </p>

              {balance !== null ? (
                <>
                  <p
                    className={`mt-1 text-2xl font-semibold tracking-tight ${
                      balance < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-foreground"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Income minus expenses for {getMonthName()}.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Income not set yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your income to see your real available balance.
                  </p>
                </>
              )}
            </div>

            {incomeSet && (
              <div className="w-full max-w-sm">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Income used
                  </span>

                  <span className="font-medium text-foreground">
                    {spendingPercentage.toFixed(0)}%
                  </span>
                </div>

                <Progress
                  value={spendingPercentage}
                  className="h-1.5"
                />

                <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    Spent {formatCompactCurrency(monthlyExpense)}
                  </span>

                  <span>
                    Income {formatCompactCurrency(monthlyIncome)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Spending trend */}
        <Card className="border-border shadow-none lg:col-span-2">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-sm font-semibold">
              Spending trend
            </CardTitle>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Daily spending this month
            </p>
          </CardHeader>

          <CardContent className="px-4 pb-4 pt-1">
            {trendData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
                No spending data for this month.
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={trendData}
                    margin={{
                      top: 8,
                      right: 8,
                      left: -12,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0.2}
                        />

                        <stop
                          offset="100%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />

                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--muted-foreground)",
                      }}
                      minTickGap={20}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--muted-foreground)",
                      }}
                      tickFormatter={(value) =>
                        formatCompactCurrency(value)
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        color: "var(--foreground)",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Spent",
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill="url(#expenseGradient)"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="border-border shadow-none">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-sm font-semibold">
              Where your money goes
            </CardTitle>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Top spending categories
            </p>
          </CardHeader>

          <CardContent className="space-y-4 px-4 pb-4 pt-2">
            {topCategories.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-center text-xs text-muted-foreground">
                No category spending yet.
              </div>
            ) : (
              topCategories.map((category) => {
                const amount = Number(category.total);

                const percentage =
                  (amount / maxCategoryAmount) * 100;

                return (
                  <div
                    key={category.category_id ?? "uncategorized"}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-medium text-foreground">
                        {category.category_name}
                      </span>

                      <span className="shrink-0 text-xs font-semibold text-foreground">
                        {formatCompactCurrency(amount)}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {category.transactions}{" "}
                      {category.transactions === 1
                        ? "transaction"
                        : "transactions"}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Recent transactions
            </CardTitle>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Your latest money activity
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              window.location.href = "/expenses";
            }}
          >
            View all
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {dashboard.recent_transactions.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {dashboard.recent_transactions.map(
                (transaction) => {
                  const isIncome =
                    transaction.type === "income";

                  return (
                    <div
                      key={`${transaction.type}-${transaction.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground sm:text-sm">
                            {transaction.title}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
                            {transaction.category ||
                              transaction.income_type ||
                              "Transaction"}{" "}
                            • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`shrink-0 text-xs font-semibold sm:text-sm ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}