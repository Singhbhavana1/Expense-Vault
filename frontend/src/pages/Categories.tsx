import { useEffect, useState } from "react";
import { Loader2, Plus, Tags, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

import {
  createCategory,
  deleteCategory,
  getCategories,
} from "@/services/expense";

import type { Category } from "@/types";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a category name.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await createCategory(trimmedName);

      setName("");
      await loadCategories();
    } catch (error: any) {
      console.error("Failed to create category:", error);

      if (error.response?.data?.name) {
        setError(
          Array.isArray(error.response.data.name)
            ? error.response.data.name[0]
            : "Category already exists.",
        );
      } else {
        setError("Failed to create category.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      setDeleteLoading(true);
      setError("");

      await deleteCategory(deletingCategory.id);

      setDeletingCategory(null);
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      setError("Failed to delete category.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
            <Tags className="h-4 w-4" />
            Expense organization
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Categories
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Organize your expenses with custom categories.
          </p>
        </div>

        {/* Add category */}
        <form
          onSubmit={handleCreate}
          className="flex w-full gap-2 sm:w-auto"
        >
          <Input
            id="category-name"
            placeholder="e.g. Food, Travel"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            className="h-9 w-full sm:w-52"
          />

          <Button
            type="submit"
            size="sm"
            className="h-9 shrink-0"
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}

            {creating ? "Adding..." : "Add"}
          </Button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary */}
      {!loading && categories.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {categories.length}{" "}
            {categories.length === 1
              ? "category"
              : "categories"}
          </span>

          <span>Custom expense categories</span>
        </div>
      )}

      {/* Category list */}
      <Card className="border-border shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center bg-blue-50 dark:bg-blue-950/50">
                <Tags className="h-5 w-5 text-primary" />
              </div>

              <h3 className="mt-3 text-sm font-semibold">
                No categories yet
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Add your first category using the field above.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden grid-cols-[1fr_180px_56px] items-center border-b border-border bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Category</span>
                <span>Created</span>
                <span />
              </div>

              <div className="divide-y divide-border">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="group grid grid-cols-[1fr_56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_180px_56px]"
                  >
                    {/* Category */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-blue-50 text-primary dark:bg-blue-950/50">
                        <Tags className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {category.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground sm:hidden">
                          Created{" "}
                          {new Date(
                            category.created_at,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Created date */}
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {new Date(
                        category.created_at,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        onClick={() =>
                          setDeletingCategory(category)
                        }
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeletingCategory(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete category?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deletingCategory?.name}
              </span>
              ?
              <br />
              Expenses using this category will keep their
              expense record, but the category will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}