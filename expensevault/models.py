from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    phone = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
    )

    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class OTPVerification(models.Model):
    PURPOSE_CHOICES = [
        ("email_verification", "Email Verification"),
        ("phone_verification", "Phone Verification"),
        ("password_reset", "Password Reset"),
        ("phone_change", "Phone Change"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="otp_verifications",
    )

    destination = models.CharField(max_length=255)

    otp_hash = models.CharField(max_length=128)

    purpose = models.CharField(
        max_length=30,
        choices=PURPOSE_CHOICES,
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(default=0)

    verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_category_per_user",
            )
        ]

    def __str__(self):
        return self.name


class Income(models.Model):
    INCOME_TYPES = [
        ("salary", "Salary"),
        ("freelance", "Freelance"),
        ("bonus", "Bonus"),
        ("interest", "Interest"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="incomes",
    )

    title = models.CharField(max_length=200)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    income_type = models.CharField(
        max_length=20,
        choices=INCOME_TYPES,
        default="other",
    )

    description = models.TextField(blank=True)

    income_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-income_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.amount}"


class Expense(models.Model):
    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("upi", "UPI"),
        ("bank", "Bank Transfer"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
    )

    title = models.CharField(max_length=200)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    description = models.TextField(blank=True)

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default="cash",
    )

    expense_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-expense_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.amount}"