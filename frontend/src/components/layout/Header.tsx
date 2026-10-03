import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import ThemeToggle from "@/components/theme-toggle";
import MobileSidebar from "./MobileSidebar";

import {
  getProfile,
  logoutUser,
} from "@/services/auth";

import type { User } from "src/types";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
    : "U";

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            ExpenseVault
          </p>

          <p className="text-xs text-muted-foreground">
            Personal Finance
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        {/* User */}
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-100 font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-foreground">
              {user
                ? `${user.first_name} ${user.last_name}`
                : "Loading..."}
            </p>

            <p className="text-xs text-muted-foreground">
              {user?.email ?? "Personal Account"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 rounded-xl text-muted-foreground hover:text-red-600"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}