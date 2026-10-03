from datetime import date, timedelta
from expensevault.models import OTPVerification
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from rest_framework import status

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils.firebase import verify_firebase_id_token

from expensevault.utils.otp import (
    create_otp,
    verify_otp,
    send_email_otp,
    send_sms_otp,
)

User = get_user_model()
from .models import Category, Expense, Income
from .serializers import (
    RegisterSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    ForgotPasswordSerializer,
    VerifyResetOTPSerializer,
    ResetPasswordSerializer,
    IncomeSerializer,
    ProfileSerializer,
    UserSerializer,
    DashboardSerializer,
    # ReportsSerializer,
    CategorySerializer,
    ExpenseSerializer,
    FirebasePhoneVerifySerializer,
)


# =========================================================
# AUTH
# =========================================================


# class RegisterView(APIView):
#     permission_classes = []

#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)

#         if serializer.is_valid():
#             user = serializer.save()

#             refresh = RefreshToken.for_user(user)

#             return Response(
#                 {
#                     "message": "Registration successful.",
#                     "access": str(refresh.access_token),
#                     "refresh": str(refresh),
#                 },
#                 status=status.HTTP_201_CREATED,
#             )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST,
#         )
 
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Only mobile OTP is required during registration.
        phone_otp = create_otp(
            user=user,
            destination=user.phone,
            purpose="phone_verification",
        )

        send_sms_otp(
            user.phone,
            phone_otp,
            "phone_verification",
        )

        return Response(
            {
                "message": (
                    "Account created. "
                    "A verification OTP has been sent to your mobile number."
                ),
                "email": user.email,
                "phone": user.phone,
            },
            status=status.HTTP_201_CREATED,
        )

class MobileLoginSerializer(TokenObtainPairSerializer):
    username_field = "phone"

    def validate(self, attrs):
        phone = attrs.get("phone")
        password = attrs.get("password")

        if not phone or not password:
            raise serializers.ValidationError(
                "Mobile number and password are required."
            )

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid mobile number or password."
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                "Invalid mobile number or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Please verify your mobile number first."
            )

        refresh = self.get_token(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class LoginView(TokenObtainPairView):
    serializer_class = MobileLoginSerializer


class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower()
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid verification request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.email_verified:
            return Response({
                "message": "Email is already verified."
            })

        valid = verify_otp(
            user=user,
            otp=otp,
            purpose="email_verification",
        )

        if not valid:
            return Response(
                {"detail": "Invalid or expired OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email_verified = True
        user.save(update_fields=["email_verified"])

        if user.phone_verified:
            user.is_active = True
            user.save(update_fields=["is_active"])

        return Response({
            "message": "Email verified successfully.",
            "email_verified": True,
            "phone_verified": user.phone_verified,
            "account_active": user.is_active,
        })

class VerifyPhoneOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid verification request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.phone_verified:
            return Response(
                {
                    "message": "Mobile number is already verified.",
                    "phone_verified": True,
                    "account_active": user.is_active,
                }
            )

        valid = verify_otp(
            user=user,
            otp=otp,
            purpose="phone_verification",
        )

        if not valid:
            return Response(
                {"detail": "Invalid or expired OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.phone_verified = True
        user.is_active = True

        user.save(
            update_fields=[
                "phone_verified",
                "is_active",
            ]
        )
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Mobile number verified successfully.",
                "phone_verified": True,
                "account_active": True,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {
                    "message": (
                        "If the account exists, "
                        "a verification OTP was sent."
                    )
                }
            )

        if user.phone_verified:
            return Response(
                {
                    "message": "Mobile number is already verified."
                }
            )

        phone_otp = create_otp(
            user=user,
            destination=user.phone,
            purpose="phone_verification",
        )

        send_sms_otp(
            user.phone,
            phone_otp,
            "phone_verification",
        )

        return Response(
            {
                "message": "Mobile verification OTP resent."
            }
        )

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower()

        try:
            user = User.objects.get(
                email=email,
                email_verified=True,
            )
        except User.DoesNotExist:
            return Response({
                "message": (
                    "If the account exists, "
                    "a password reset OTP has been sent."
                )
            })

        otp = create_otp(
            user=user,
            destination=user.email,
            purpose="password_reset",
        )

        send_email_otp(
            user.email,
            otp,
            "password_reset",
        )

        return Response({
            "message": "Password reset OTP sent."
        })       

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        firebase_token = request.data.get("firebase_token")
        new_password = request.data.get("new_password")

        if not firebase_token:
            return Response(
                {"detail": "Firebase verification token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not new_password:
            return Response(
                {"detail": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"detail": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify Firebase OTP session
        try:
            decoded_token = verify_firebase_id_token(firebase_token)
        except Exception:
            return Response(
                {"detail": "Invalid or expired Firebase verification."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        firebase_phone = decoded_token.get("phone_number")

        if not firebase_phone:
            return Response(
                {"detail": "Firebase token does not contain a phone number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Firebase gives +91XXXXXXXXXX
        if firebase_phone.startswith("+91"):
            phone = firebase_phone[3:]
        else:
            phone = firebase_phone.lstrip("+")

        User = get_user_model()

        user = User.objects.filter(phone=phone).first()

        if not user:
            return Response(
                {"detail": "No account found for this mobile number."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Update Django password
        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {
                "message": "Password reset successfully.",
            },
            status=status.HTTP_200_OK,
        )

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# =========================================================
# CATEGORY
# =========================================================

class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(
            user=request.user
        )

        serializer = CategorySerializer(
            categories,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return Category.objects.get(
                id=pk,
                user=request.user,
            )
        except Category.DoesNotExist:
            return None

    def get(self, request, pk):
        category = self.get_object(request, pk)

        if not category:
            return Response(
                {"detail": "Category not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CategorySerializer(category)

        return Response(serializer.data)

    def put(self, request, pk):
        category = self.get_object(request, pk)

        if not category:
            return Response(
                {"detail": "Category not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CategorySerializer(
            category,
            data=request.data,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        category = self.get_object(request, pk)

        if not category:
            return Response(
                {"detail": "Category not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        category.delete()

        return Response(
            {"message": "Category deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


# =========================================================
# EXPENSE
# =========================================================

class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = (
            Expense.objects
            .filter(user=request.user)
            .select_related("category")
        )

        serializer = ExpenseSerializer(
            expenses,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return (
                Expense.objects
                .select_related("category")
                .get(
                    id=pk,
                    user=request.user,
                )
            )
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self.get_object(request, pk)

        if not expense:
            return Response(
                {"detail": "Expense not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ExpenseSerializer(expense)

        return Response(serializer.data)

    def put(self, request, pk):
        expense = self.get_object(request, pk)

        if not expense:
            return Response(
                {"detail": "Expense not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ExpenseSerializer(
            expense,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        expense = self.get_object(request, pk)

        if not expense:
            return Response(
                {"detail": "Expense not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        expense.delete()

        return Response(
            {"message": "Expense deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


# =========================================================
# INCOME
# =========================================================

class IncomeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        incomes = Income.objects.filter(
            user=request.user
        )

        serializer = IncomeSerializer(
            incomes,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = IncomeSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class IncomeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return Income.objects.get(
                id=pk,
                user=request.user,
            )
        except Income.DoesNotExist:
            return None

    def get(self, request, pk):
        income = self.get_object(request, pk)

        if not income:
            return Response(
                {"detail": "Income not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = IncomeSerializer(income)

        return Response(serializer.data)

    def put(self, request, pk):
        income = self.get_object(request, pk)

        if not income:
            return Response(
                {"detail": "Income not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = IncomeSerializer(
            income,
            data=request.data,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        income = self.get_object(request, pk)

        if not income:
            return Response(
                {"detail": "Income not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        income.delete()

        return Response(
            {"message": "Income deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


# =========================================================
# DASHBOARD
# =========================================================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()

        month_start = today.replace(day=1)

        if today.month == 12:
            next_month = today.replace(
                year=today.year + 1,
                month=1,
                day=1,
            )
        else:
            next_month = today.replace(
                month=today.month + 1,
                day=1,
            )

        expenses = Expense.objects.filter(
            user=request.user
        ).select_related("category")

        incomes = Income.objects.filter(
            user=request.user
        )

        monthly_expenses = expenses.filter(
            expense_date__gte=month_start,
            expense_date__lt=next_month,
        )

        monthly_income = incomes.filter(
            income_date__gte=month_start,
            income_date__lt=next_month,
        )

        total_expense = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        total_income = (
            incomes.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        month_expense = (
            monthly_expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        month_income = (
            monthly_income.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        total_transactions = expenses.count()

        average_transaction = (
            total_expense / total_transactions
            if total_transactions > 0
            else 0
        )

        monthly_savings = month_income - month_expense

        savings_rate = (
            (monthly_savings / month_income) * 100
            if month_income > 0
            else None
        )

        # -------------------------------------------------
        # CATEGORY EXPENSES
        # -------------------------------------------------

        category_data = (
            monthly_expenses
            .values(
                "category__id",
                "category__name",
            )
            .annotate(
                total=Sum("amount"),
                transactions=Count("id"),
            )
            .order_by("-total")
        )

        category_expenses = []

        for item in category_data:
            category_expenses.append(
                {
                    "category_id": item["category__id"],
                    "category_name": (
                        item["category__name"]
                        or "Uncategorized"
                    ),
                    "total": item["total"],
                    "transactions": item["transactions"],
                }
            )

        # -------------------------------------------------
        # DAILY EXPENSE TREND
        # -------------------------------------------------

        daily_data = (
            monthly_expenses
            .annotate(
                date=TruncDate("expense_date")
            )
            .values("date")
            .annotate(total=Sum("amount"))
            .order_by("date")
        )

        expense_trend = []

        for item in daily_data:
            expense_trend.append(
                {
                    "date": item["date"],
                    "total": item["total"],
                }
            )

        # -------------------------------------------------
        # RECENT TRANSACTIONS
        # -------------------------------------------------

        recent_expenses = expenses.order_by(
            "-expense_date",
            "-created_at",
        )[:5]

        recent_incomes = incomes.order_by(
            "-income_date",
            "-created_at",
        )[:5]

        recent_transactions = []

        for expense in recent_expenses:
            recent_transactions.append(
                {
                    "id": expense.id,
                    "title": expense.title,
                    "amount": expense.amount,
                    "type": "expense",
                    "payment_method": expense.payment_method,
                    "income_type": None,
                    "date": expense.expense_date,
                    "category": (
                        expense.category.name
                        if expense.category
                        else None
                    ),
                }
            )

        for income in recent_incomes:
            recent_transactions.append(
                {
                    "id": income.id,
                    "title": income.title,
                    "amount": income.amount,
                    "type": "income",
                    "payment_method": None,
                    "income_type": income.income_type,
                    "date": income.income_date,
                    "category": None,
                }
            )

        recent_transactions.sort(
            key=lambda item: item["date"],
            reverse=True,
        )

        recent_transactions = recent_transactions[:8]

        return Response(
            {
                "total_expense": total_expense,
                "total_income": total_income,
                "monthly_expense": month_expense,
                "monthly_income": month_income,
                "monthly_savings": monthly_savings,
                "savings_rate": savings_rate,
                "total_transactions": total_transactions,
                "average_transaction": average_transaction,
                "category_expenses": category_expenses,
                "expense_trend": expense_trend,
                "recent_transactions": recent_transactions,
                "income_set": incomes.exists(),
            }
        )


# =========================================================
# REPORTS
# =========================================================

class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()

        period = request.query_params.get(
            "period",
            "this_month",
        )

        start_date = request.query_params.get(
            "start_date"
        )

        end_date = request.query_params.get(
            "end_date"
        )

        # -------------------------------------------------
        # DATE RANGE
        # -------------------------------------------------

        if period == "today":
            current_start = today
            current_end = today

        elif period == "this_week":
            current_start = today - timedelta(
                days=today.weekday()
            )
            current_end = today

        elif period == "this_month":
            current_start = today.replace(day=1)
            current_end = today

        elif period == "last_month":
            first_this_month = today.replace(day=1)

            last_month_end = (
                first_this_month - timedelta(days=1)
            )

            current_start = last_month_end.replace(day=1)
            current_end = last_month_end

        elif period == "last_3_months":
            current_start = (
                today.replace(day=1)
                - timedelta(days=1)
            )

            for _ in range(2):
                current_start = (
                    current_start.replace(day=1)
                    - timedelta(days=1)
                )

            current_start = current_start.replace(day=1)
            current_end = today

        elif period == "last_6_months":
            current_start = (
                today.replace(day=1)
                - timedelta(days=1)
            )

            for _ in range(5):
                current_start = (
                    current_start.replace(day=1)
                    - timedelta(days=1)
                )

            current_start = current_start.replace(day=1)
            current_end = today

        elif period == "this_year":
            current_start = date(
                today.year,
                1,
                1,
            )
            current_end = today

        elif period == "custom" and start_date and end_date:
            try:
                current_start = date.fromisoformat(
                    start_date
                )

                current_end = date.fromisoformat(
                    end_date
                )
            except ValueError:
                return Response(
                    {
                        "detail": (
                            "Invalid date format. "
                            "Use YYYY-MM-DD."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:
            current_start = today.replace(day=1)
            current_end = today
            period = "this_month"

        if current_start > current_end:
            return Response(
                {
                    "detail": (
                        "Start date cannot be after end date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # CURRENT PERIOD
        # -------------------------------------------------

        expenses = Expense.objects.filter(
            user=request.user,
            expense_date__gte=current_start,
            expense_date__lte=current_end,
        ).select_related("category")

        incomes = Income.objects.filter(
            user=request.user,
            income_date__gte=current_start,
            income_date__lte=current_end,
        )

        total_expense = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        total_income = (
            incomes.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        savings = total_income - total_expense

        savings_rate = (
            (savings / total_income) * 100
            if total_income > 0
            else None
        )

        # -------------------------------------------------
        # CATEGORY BREAKDOWN
        # -------------------------------------------------

        category_data = (
            expenses
            .values(
                "category__id",
                "category__name",
            )
            .annotate(
                total=Sum("amount"),
                transactions=Count("id"),
            )
            .order_by("-total")
        )

        categories = []

        for item in category_data:
            categories.append(
                {
                    "category_id": item["category__id"],
                    "category_name": (
                        item["category__name"]
                        or "Uncategorized"
                    ),
                    "total": item["total"],
                    "transactions": item["transactions"],
                }
            )

        # -------------------------------------------------
        # DAILY TREND
        # -------------------------------------------------

        daily_data = (
            expenses
            .annotate(
                date=TruncDate("expense_date")
            )
            .values("date")
            .annotate(total=Sum("amount"))
            .order_by("date")
        )

        expense_trend = [
            {
                "date": item["date"],
                "total": item["total"],
            }
            for item in daily_data
        ]

        # -------------------------------------------------
        # MONTHLY TREND
        # -------------------------------------------------

        monthly_expenses = (
            expenses
            .annotate(
                month=TruncMonth("expense_date")
            )
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        monthly_incomes = (
            incomes
            .annotate(
                month=TruncMonth("income_date")
            )
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        income_by_month = {
            item["month"].strftime("%Y-%m"): item["total"]
            for item in monthly_incomes
        }

        monthly_trend = []

        for item in monthly_expenses:
            key = item["month"].strftime("%Y-%m")

            income_amount = (
                income_by_month.get(key) or 0
            )

            expense_amount = item["total"]

            monthly_trend.append(
                {
                    "month": key,
                    "income": income_amount,
                    "expense": expense_amount,
                    "savings": income_amount - expense_amount,
                }
            )

        # Add income-only months
        existing_months = {
            item["month"]
            for item in monthly_expenses
        }

        for item in monthly_incomes:
            if item["month"] not in existing_months:
                key = item["month"].strftime("%Y-%m")

                monthly_trend.append(
                    {
                        "month": key,
                        "income": item["total"],
                        "expense": 0,
                        "savings": item["total"],
                    }
                )

        monthly_trend.sort(
            key=lambda item: item["month"]
        )

        # -------------------------------------------------
        # TRANSACTION COUNT
        # -------------------------------------------------

        expense_transactions = expenses.count()
        income_transactions = incomes.count()

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return Response(
            {
                "period": period,
                "start_date": current_start,
                "end_date": current_end,

                "summary": {
                    "income": total_income,
                    "expense": total_expense,
                    "savings": savings,
                    "savings_rate": savings_rate,
                    "income_set": Income.objects.filter(
                        user=request.user
                    ).exists(),
                },

                "transactions": {
                    "income": income_transactions,
                    "expense": expense_transactions,
                    "total": (
                        income_transactions
                        + expense_transactions
                    ),
                },

                "categories": categories,

                "expense_trend": expense_trend,

                "monthly_trend": monthly_trend,
            }
        )

class FirebasePhoneVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FirebasePhoneVerifySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        firebase_token = serializer.validated_data["firebase_token"]

        try:
            decoded_token = verify_firebase_id_token(firebase_token)
        except Exception:
            return Response(
                {"detail": "Invalid or expired Firebase token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        firebase_phone = decoded_token.get("phone_number")

        if not firebase_phone:
            return Response(
                {"detail": "Firebase token does not contain a phone number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if firebase_phone.startswith("+91"):
            phone = firebase_phone[3:]
        else:
            phone = firebase_phone.lstrip("+")

        user = User.objects.filter(phone=phone).first()

        if not user:
            return Response(
                {"detail": "No account found for this mobile number."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.phone_verified = True
        user.is_active = True
        user.save(update_fields=["phone_verified", "is_active"])

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Mobile number verified successfully.",
                "phone_verified": True,
                "account_active": True,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        user.delete()

        return Response(
            {
                "message": "Account deleted successfully."
            },
            status=status.HTTP_200_OK,
        )