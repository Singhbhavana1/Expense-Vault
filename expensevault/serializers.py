from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Expense, Income

User = get_user_model()

class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    phone_verified = serializers.BooleanField(read_only=True)

# class RegisterSerializer(serializers.Serializer):
#     username = serializers.CharField(max_length=150)
#     email = serializers.EmailField()
#     first_name = serializers.CharField(max_length=150)
#     last_name = serializers.CharField(max_length=150)
#     password = serializers.CharField(write_only=True, min_length=6)
#     password_confirm = serializers.CharField(write_only=True)

#     def validate_email(self, value):
#         from .models import User

#         if User.objects.filter(email=value).exists():
#             raise serializers.ValidationError(
#                 "A user with this email already exists."
#             )

#         return value

#     def validate(self, attrs):
#         if attrs["password"] != attrs["password_confirm"]:
#             raise serializers.ValidationError(
#                 {"password_confirm": "Passwords do not match."}
#             )

#         return attrs

#     def create(self, validated_data):
#         validated_data.pop("password_confirm")

#         user = User.objects.create_user(
#             username=validated_data["username"],
#             email=validated_data["email"],
#             first_name=validated_data["first_name"],
#             last_name=validated_data["last_name"],
#             password=validated_data["password"],
#         )

#         return user

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    phone = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
            "phone",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):
        if not value:
            return ""

        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Mobile number is required."
            )

        if not value.isdigit():
            raise serializers.ValidationError(
                "Mobile number must contain only digits."
            )

        if len(value) != 10:
            raise serializers.ValidationError(
                "Mobile number must contain 10 digits."
            )

        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "This mobile number is already registered."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm":
                    "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            **validated_data,
            password=password,
        )

        # Account becomes active after mobile OTP verification.
        user.is_active = False
        user.email_verified = False
        user.phone_verified = False

        user.save(
            update_fields=[
                "is_active",
                "email_verified",
                "phone_verified",
            ]
        )

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
    )

    phone = serializers.CharField(
        required=True,
    )

    otp = serializers.CharField(
        min_length=6,
        max_length=6,
    )


class ResendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(
        required=True,
    )

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyResetOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(
        min_length=6,
        max_length=6,
    )


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    otp = serializers.CharField(
        min_length=6,
        max_length=6,
    )

    password = serializers.CharField(
        min_length=8,
        write_only=True,
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm":
                    "Passwords do not match."
                }
            )

        return attrs

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "email_verified",
            "phone_verified",
        ]
        read_only_fields = [
            "id",
            "username",
            "email_verified",
            "phone_verified",
        ]




class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "title",
            "amount",
            "description",
            "payment_method",
            "expense_date",
            "category",
            "category_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "category_name",
            "created_at",
            "updated_at",
        ]

    def validate_category(self, category):
        request = self.context.get("request")

        if request and category:
            if category.user != request.user:
                raise serializers.ValidationError(
                    "You cannot use this category."
                )

        return category


class IncomeSerializer(serializers.ModelSerializer):
    income_type_display = serializers.CharField(
        source="get_income_type_display",
        read_only=True,
    )

    class Meta:
        model = Income
        fields = [
            "id",
            "title",
            "amount",
            "income_type",
            "income_type_display",
            "description",
            "income_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "income_type_display",
            "created_at",
            "updated_at",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Income amount must be greater than zero."
            )

        return value


class RecentTransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    type = serializers.CharField()
    payment_method = serializers.CharField(
        required=False,
        allow_null=True,
    )
    income_type = serializers.CharField(
        required=False,
        allow_null=True,
    )
    date = serializers.DateField()
    category = serializers.CharField(
        required=False,
        allow_null=True,
    )


class DashboardSerializer(serializers.Serializer):
    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_transactions = serializers.IntegerField()

    recent_transactions = RecentTransactionSerializer(
        many=True,
    )