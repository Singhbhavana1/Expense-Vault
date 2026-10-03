import {
  BarChart3,
  LayoutDashboard,
  Receipt,
  Tags,
  UserRound,
  Wallet,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    title: "Income",
    href: "/income",
    icon: Wallet,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tags,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-0 flex h-screen w-60 flex-col border-r border-border bg-background">
        {/* Brand */}
        <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <WalletCards className="h-[18px] w-[18px] text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              ExpenseVault
            </h1>

            <p className="text-[11px] text-muted-foreground">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Menu
          </p>

          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    [
                      "flex h-10 items-center gap-3 rounded-lg px-3",
                      "text-[13px] font-medium",
                      "transition-colors duration-150",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <Icon className="h-[17px] w-[17px] shrink-0" />

                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-border p-3">
          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-foreground">
              ExpenseVault
            </p>

            <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
              Manage your money wisely.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}