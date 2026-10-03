import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  FileBarChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getReport,
  type ReportData,
  type ReportPeriod,
} from "@/services/report";

const periodOptions: {
  value: ReportPeriod;
  label: string;
}[] = [
  {
    value: "this_month",
    label: "This Month",
  },
  {
    value: "last_month",
    label: "Last Month",
  },
  {
    value: "last_3_months",
    label: "Last 3 Months",
  },
  {
    value: "last_6_months",
    label: "Last 6 Months",
  },
  {
    value: "this_year",
    label: "This Year",
  },
  {
    value: "custom",
    label: "Custom Range",
  },
];

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
    year: "numeric",
  });
}

function formatMonth(month: string) {
  const date = new Date(`${month}-01`);

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export default function Reports() {
  const [period, setPeriod] =
    useState<ReportPeriod>("this_month");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [report, setReport] =
    useState<ReportData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async (
    selectedPeriod: ReportPeriod = period,
    startDate = customStart,
    endDate = customEnd,
  ) => {
    try {
      setLoading(true);
      setError("");

      const data = await getReport(
        selectedPeriod,
        startDate,
        endDate,
      );

      setReport(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== "custom") {
      loadReport(period);
    }
  }, [period]);

  const savingsRate =
    report?.summary.savings_rate !== null &&
    report?.summary.savings_rate !== undefined
      ? Number(report.summary.savings_rate)
      : null;

  const monthlyChartData = useMemo(() => {
    if (!report) return [];

    return report.monthly_trend.map((item) => ({
      month: formatMonth(item.month),
      income: Number(item.income),
      expense: Number(item.expense),
      savings: Number(item.savings),
    }));
  }, [report]);

  const maxCategoryAmount = Math.max(
    ...(report?.categories ?? []).map((item) =>
      Number(item.total),
    ),
    1,
  );

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
            <FileBarChart className="h-4 w-4" />
            Financial analysis
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Reports
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand how your income and spending change
            over time.
          </p>
        </div>

        {/* Top-right filters */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {period === "custom" && (
            <>
              <Input
                type="date"
                value={customStart}
                onChange={(event) =>
                  setCustomStart(event.target.value)
                }
                className="h-9 w-full sm:w-36"
              />

              <span className="hidden text-xs text-muted-foreground sm:block">
                to
              </span>

              <Input
                type="date"
                value={customEnd}
                onChange={(event) =>
                  setCustomEnd(event.target.value)
                }
                className="h-9 w-full sm:w-36"
              />

              <Button
                size="sm"
                className="h-9"
                disabled={!customStart || !customEnd}
                onClick={() =>
                  loadReport(
                    "custom",
                    customStart,
                    customEnd,
                  )
                }
              >
                Apply
              </Button>
            </>
          )}

          <Select
            value={period}
            onValueChange={(value) =>
              setPeriod(value as ReportPeriod)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected period */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />

          {report ? (
            <span className="truncate">
              {formatDate(report.start_date)} –{" "}
              {formatDate(report.end_date)}
            </span>
          ) : (
            <span>Report period</span>
          )}
        </div>

        {report && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {report.transactions.total} transactions
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse bg-muted"
            />
          ))}
        </div>
      ) : report ? (
        <>
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* Income */}
            <Card className="border-border shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Income
                    </p>

                    <p className="mt-1.5 truncate text-xl font-semibold tracking-tight">
                      {report.summary.income_set
                        ? formatCurrency(
                            report.summary.income,
                          )
                        : "Not set"}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="border-border shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Expenses
                    </p>

                    <p className="mt-1.5 truncate text-xl font-semibold tracking-tight">
                      {formatCurrency(
                        report.summary.expense,
                      )}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card className="border-border shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Savings
                    </p>

                    <p
                      className={`mt-1.5 truncate text-xl font-semibold tracking-tight ${
                        Number(report.summary.savings) < 0
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }`}
                    >
                      {report.summary.income_set
                        ? formatCurrency(
                            report.summary.savings,
                          )
                        : "—"}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings rate */}
            <Card className="border-border shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Savings rate
                    </p>

                    <p className="mt-1.5 truncate text-xl font-semibold tracking-tight">
                      {savingsRate !== null
                        ? `${savingsRate.toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income warning */}
          {!report.summary.income_set && (
            <Card className="border-blue-200 bg-blue-50/50 shadow-none dark:border-blue-900/60 dark:bg-blue-950/20">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Income isn't set yet
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Add your salary or other income to unlock
                    savings and savings-rate analysis.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    window.location.href = "/income";
                  }}
                  className="shrink-0"
                >
                  Add Income
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Monthly trend */}
          <Card className="border-border shadow-none">
            <CardHeader className="px-4 pb-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Income vs spending
                  </CardTitle>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Monthly financial movement for the selected
                    period.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              {monthlyChartData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                  Not enough data for this period.
                </div>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={monthlyChartData}
                      margin={{
                        top: 8,
                        right: 8,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-border"
                      />

                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "var(--muted-foreground)",
                        }}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        tick={{
                          fontSize: 10,
                          fill: "var(--muted-foreground)",
                        }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value)
                        }
                      />

                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name === "income"
                            ? "Income"
                            : name === "expense"
                              ? "Expenses"
                              : "Savings",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border:
                            "1px solid var(--border)",
                          background:
                            "var(--card)",
                          color:
                            "var(--foreground)",
                        }}
                      />

                      <Bar
                        dataKey="income"
                        fill="var(--color-success)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                      />

                      <Bar
                        dataKey="expense"
                        fill="var(--color-destructive)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense trend + categories */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Expense trend */}
            <Card className="border-border shadow-none lg:col-span-3">
              <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">
                  Spending trend
                </CardTitle>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Daily expense activity.
                </p>
              </CardHeader>

              <CardContent className="px-4 pb-4">
                {report.expense_trend.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No expense data available.
                  </div>
                ) : (
                  <div className="h-56 w-full">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={report.expense_trend.map(
                          (item) => ({
                            date: formatDate(item.date),
                            amount: Number(item.total),
                          }),
                        )}
                        margin={{
                          top: 8,
                          right: 8,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="reportExpenseGradient"
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
                          strokeDasharray="4 4"
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
                          width={48}
                          tick={{
                            fontSize: 10,
                            fill: "var(--muted-foreground)",
                          }}
                          tickFormatter={(value) =>
                            formatCompactCurrency(value)
                          }
                        />

                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(Number(value)),
                            "Expenses",
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            border:
                              "1px solid var(--border)",
                            background:
                              "var(--card)",
                            color:
                              "var(--foreground)",
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          fill="url(#reportExpenseGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-border shadow-none lg:col-span-2">
              <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">
                  Spending by category
                </CardTitle>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your biggest spending areas.
                </p>
              </CardHeader>

              <CardContent className="px-4 pb-4">
                {report.categories.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No category data available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.categories
                      .slice(0, 6)
                      .map((category) => {
                        const amount = Number(
                          category.total,
                        );

                        const percentage =
                          (amount /
                            maxCategoryAmount) *
                          100;

                        return (
                          <div
                            key={
                              category.category_id ??
                              "uncategorized"
                            }
                          >
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                              <span className="truncate text-xs font-medium">
                                {category.category_name}
                              </span>

                              <span className="shrink-0 text-xs font-semibold">
                                {formatCompactCurrency(
                                  amount,
                                )}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden bg-muted">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {category.transactions}{" "}
                              {category.transactions ===
                              1
                                ? "transaction"
                                : "transactions"}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial insight */}
          <Card className="border-border bg-slate-950 text-white shadow-none dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/10">
                  <TrendingUp className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Financial insight
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    {report.summary.income_set
                      ? Number(
                          report.summary.expense,
                        ) === 0
                        ? "You haven't recorded any expenses for this period yet."
                        : Number(
                              report.summary.savings,
                            ) >= 0
                          ? `You earned ${formatCurrency(
                              report.summary.income,
                            )} and spent ${formatCurrency(
                              report.summary.expense,
                            )} during this period. Your recorded savings are ${formatCurrency(
                              report.summary.savings,
                            )}.`
                          : `Your recorded expenses of ${formatCurrency(
                              report.summary.expense,
                            )} are higher than your income of ${formatCurrency(
                              report.summary.income,
                            )} for this period.`
                      : `You've recorded ${formatCurrency(
                          report.summary.expense,
                        )} in expenses. Add your income to understand your actual savings.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-border shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Income transactions
                  </p>

                  <p className="mt-0.5 text-lg font-semibold">
                    {report.transactions.income}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <TrendingDown className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Expense transactions
                  </p>

                  <p className="mt-0.5 text-lg font-semibold">
                    {report.transactions.expense}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <CircleDollarSign className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Total transactions
                  </p>

                  <p className="mt-0.5 text-lg font-semibold">
                    {report.transactions.total}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}