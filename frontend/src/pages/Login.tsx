import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const trimmedPhone = phone.trim();

    if (!trimmedPhone || !password) {
      setError(
        "Please enter your mobile number and password.",
      );
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setLoading(true);

      await loginUser({
        phone: trimmedPhone,
        password,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);

      const data = err?.response?.data;

      const message =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        "Invalid mobile number or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#101828] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#101828]">
                <span className="text-lg font-bold">
                  E
                </span>
              </div>

              <span className="text-lg font-semibold tracking-tight">
                ExpenseVault
              </span>
            </div>
          </div>

          <div className="relative max-w-md">
            <p className="mb-5 text-sm font-medium text-blue-300">
              PERSONAL FINANCE, SIMPLIFIED
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] xl:text-5xl">
              Know where your money goes.
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-slate-400">
              Track your spending, understand your habits and
              make better financial decisions with one clear
              view of your money.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Your financial data stays private
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Simple tracking without the clutter
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Insights that make your numbers useful
              </div>
            </div>
          </div>

          <p className="relative text-xs text-slate-500">
            © {new Date().getFullYear()} ExpenseVault
          </p>
        </section>

        {/* Login */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101828] text-white dark:bg-white dark:text-[#101828]">
                <span className="text-lg font-bold">
                  E
                </span>
              </div>

              <span className="text-lg font-semibold tracking-tight">
                ExpenseVault
              </span>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium text-primary">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pick up where you left off and see what your
                money is doing.
              </p>
            </div>

            {error && (
              <div className="mb-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Mobile */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Mobile number
                </Label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(/\D/g, "");

                      setPhone(value);
                    }}
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    Password
                  </Label>

                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="h-11 px-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />

              <span className="text-xs text-muted-foreground">
                NEW TO EXPENSEVAULT?
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              asChild
              variant="outline"
              className="h-11 w-full"
            >
              <Link to="/register">
                Create an account
              </Link>
            </Button>

            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
              By continuing, you agree to use ExpenseVault
              responsibly for managing your financial records.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}