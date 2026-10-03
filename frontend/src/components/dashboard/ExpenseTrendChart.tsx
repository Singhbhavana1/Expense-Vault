import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ExpenseTrend } from "@/types";

interface ExpenseTrendChartProps {
  data: ExpenseTrend[];
}

export default function ExpenseTrendChart({
  data,
}: ExpenseTrendChartProps) {
  const chartData = data.map((item) => ({
    date: item.date,
    amount: Number(item.total),
  }));

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-semibold">
          Expense Trend
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          Your spending over time
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-1">
        {chartData.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
            No expense data available yet.
          </div>
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 8,
                  left: -12,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
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
                  tickFormatter={(value) => `₹${value}`}
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
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "Expense",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}