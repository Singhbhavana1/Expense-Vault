from django.contrib import admin

from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    Category,
    Expense,
)


# =========================================================
# USER
# =========================================================

@admin.register(User)
class CustomUserAdmin(UserAdmin):

    model = User

    list_display = [
        "id",
        "email",
        "username",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
    ]

    ordering = [
        "email"
    ]

# =========================================================
# CATEGORY
# =========================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = [

        "id",

        "name",

        "user",

        "created_at",
    ]


    search_fields = [
        "name"
    ]


# =========================================================
# EXPENSE
# =========================================================

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):

    list_display = [

        "id",

        "title",

        "amount",

        "category",

        "payment_method",

        "expense_date",

        "user",
    ]


    list_filter = [

        "payment_method",

        "expense_date",

        "category",
    ]


    search_fields = [

        "title",

        "description",
    ]