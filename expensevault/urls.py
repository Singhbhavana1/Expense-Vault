from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CategoryDetailView,
    CategoryListCreateView,
    DashboardView,
    ExpenseDetailView,
    ExpenseListCreateView,
    IncomeDetailView,
    FirebasePhoneVerifyView,
    IncomeListCreateView,
    ProfileView,
    RegisterView,
    ReportsView,
    LoginView,
    VerifyEmailOTPView,
    VerifyPhoneOTPView,
    ResendOTPView,
    ForgotPasswordView,
    ResetPasswordView,
    DeleteAccountView,
)


urlpatterns = [
    # =========================================================
    # AUTH
    # =========================================================

    path(
        "auth/register/",
        RegisterView.as_view(),
        name="register",
    ),

    # Future email verification
    path(
        "auth/verify-email/",
        VerifyEmailOTPView.as_view(),
        name="verify-email",
    ),

    # Registration mobile OTP
    path(
        "auth/verify-phone/",
        VerifyPhoneOTPView.as_view(),
        name="verify-phone",
    ),

    # Resend mobile OTP
    path(
        "auth/resend-otp/",
        ResendOTPView.as_view(),
        name="resend-otp",
    ),

    # Password reset
    path(
        "auth/forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),

    path(
        "auth/reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),

    # Login
    path(
        "auth/login/",
        LoginView.as_view(),
        name="login",
    ),

    # JWT refresh
    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # Profile
    path(
        "auth/profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    # =========================================================
    # DASHBOARD
    # =========================================================

    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard",
    ),

    # =========================================================
    # REPORTS
    # =========================================================

    path(
        "reports/",
        ReportsView.as_view(),
        name="reports",
    ),

    # =========================================================
    # CATEGORIES
    # =========================================================

    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),

    # =========================================================
    # EXPENSES
    # =========================================================

    path(
        "expenses/",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),

    path(
        "expenses/<int:pk>/",
        ExpenseDetailView.as_view(),
        name="expense-detail",
    ),

    # =========================================================
    # INCOME
    # =========================================================

    path(
        "income/",
        IncomeListCreateView.as_view(),
        name="income-list-create",
    ),

    path(
        "income/<int:pk>/",
        IncomeDetailView.as_view(),
        name="income-detail",
    ),
    path(
        "auth/firebase-verify-phone/",
        FirebasePhoneVerifyView.as_view(),
        name="firebase-verify-phone",
    ),
    path(
        "auth/profile/delete/",
        DeleteAccountView.as_view(),
        name="delete-account",
    ),
]