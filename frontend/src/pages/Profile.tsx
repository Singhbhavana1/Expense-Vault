import { useEffect, useState } from "react";
import {
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getProfile } from "@/services/auth";
import type { User } from "@/types";

type UserWithPhone = User & {
  phone?: string;
};

export default function Profile() {
  const [user, setUser] = useState<UserWithPhone | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = (await getProfile()) as UserWithPhone;

        setUser(profile);
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setUsername(profile.username ?? "");
        setPhone(profile.phone ?? "");
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const startEditing = () => {
    if (!user) return;

    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setUsername(user.username ?? "");
    setPhone(user.phone ?? "");

    setError("");
    setSuccess("");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!user) return;

    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setUsername(user.username ?? "");
    setPhone(user.phone ?? "");

    setError("");
    setSuccess("");
    setEditing(false);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      /*
       * Connect updateProfile API here.
       *
       * const updated = await updateProfile({
       *   first_name: firstName.trim(),
       *   last_name: lastName.trim(),
       *   username: username.trim(),
       *   phone: phone.trim(),
       * });
       *
       * setUser(updated);
       */

      const updatedUser: UserWithPhone = {
        ...user!,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        phone: phone.trim(),
      };

      setUser(updatedUser);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      setError(
        error?.response?.data?.detail ||
          "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Unable to load profile.
      </div>
    );
  }

  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="h-[calc(100vh-100px)] w-full min-w-0 overflow-hidden">
      {/* Page header */}
      <div className="flex h-[58px] items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
            <UserRound className="h-3.5 w-3.5" />
            Account
          </div>

          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
            Profile
          </h1>

          <p className="text-xs text-muted-foreground">
            Manage your account information.
          </p>
        </div>

        {!editing ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={startEditing}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={cancelEditing}
              disabled={saving}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Cancel
            </Button>

            <Button
              size="sm"
              className="h-8"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}

              Save
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      {(error || success) && (
        <div
          className={`mb-2 px-3 py-2 text-xs ${
            error
              ? "border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
          }`}
        >
          {error || success}
        </div>
      )}

      {/* Main profile card */}
      <Card className="border-border shadow-none mt-4">
        <CardContent className="p-4">
          {/* Profile overview */}
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-50 text-sm font-semibold text-primary dark:bg-blue-950/50">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">
                {user.first_name} {user.last_name}
              </h2>

              <p className="text-xs text-muted-foreground">
                @{user.username}
              </p>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>

                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {user.phone || "No mobile number"}
                </span>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Account Information
              </h2>

              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Personal details
              </span>
            </div>

            {editing ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="first-name"
                    className="text-[11px]"
                  >
                    First Name
                  </Label>

                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="last-name"
                    className="text-[11px]"
                  >
                    Last Name
                  </Label>

                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="username"
                    className="text-[11px]"
                  >
                    Username
                  </Label>

                  <Input
                    id="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-[11px]"
                  >
                    Mobile Number
                  </Label>

                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    placeholder="10-digit mobile"
                    onChange={(e) =>
                      setPhone(
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-[11px]">
                    Email
                  </Label>

                  <Input
                    value={user.email}
                    disabled
                    className="h-8 bg-muted/40 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-x-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    First Name
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {user.first_name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Last Name
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {user.last_name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Username
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {user.username}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Mobile
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {user.phone || "Not added"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Email row */}
          {!editing && (
            <div className="border-t border-border py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Email Address
                  </p>

                  <p className="mt-0.5 text-sm font-medium">
                    {user.email}
                  </p>
                </div>

                <span className="text-[10px] text-muted-foreground">
                  Used for login & recovery
                </span>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center bg-muted">
                <KeyRound className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Password
                </p>

                <p className="text-[11px] text-muted-foreground">
                  Change or recover your password
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                window.location.href = "/forgot-password";
              }}
            >
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}