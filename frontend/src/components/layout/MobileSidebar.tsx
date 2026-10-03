import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Receipt,
  Tags,
  UserRound,
  Wallet,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
    title: "Categories",
    href: "/categories",
    icon: Tags,
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
    title: "Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl lg:hidden"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 bg-background p-0"
      >
        <SheetHeader className="border-b p-6 text-left">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <WalletCards className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-base font-bold">
                ExpenseVault
              </p>

              <p className="text-xs font-normal text-muted-foreground">
                Personal Finance
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}