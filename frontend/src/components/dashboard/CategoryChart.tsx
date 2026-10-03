import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { CategoryExpense } from "@/types";

interface CategoryChartProps {
  data: CategoryExpense[];
}

const chartColors = [
  "var(--color-primary)",
  "var(--color-success)",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    name: item.category_name,
    value: Number(item.total),
  }));

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-semibold">
          Spending by Category
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          Where your money is going
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-1">
        {chartData.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
            No category data available yet.
          </div>
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}