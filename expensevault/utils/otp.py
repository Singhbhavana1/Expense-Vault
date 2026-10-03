import random
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.utils import timezone

from expensevault.models import OTPVerification


OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


def generate_otp():
    return f"{random.randint(100000, 999999)}"


def create_otp(user, destination, purpose):
    OTPVerification.objects.filter(
        user=user,
        purpose=purpose,
        verified=False,
    ).update(verified=True)

    otp = generate_otp()

    OTPVerification.objects.create(
        user=user,
        destination=destination,
        otp_hash=make_password(otp),
        purpose=purpose,
        expires_at=timezone.now()
        + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )

    return otp


def verify_otp(user, otp, purpose):
    record = (
        OTPVerification.objects
        .filter(
            user=user,
            purpose=purpose,
            verified=False,
            expires_at__gt=timezone.now(),
            attempts__lt=MAX_OTP_ATTEMPTS,
        )
        .first()
    )

    if not record:
        return False

    record.attempts += 1

    if check_password(otp, record.otp_hash):
        record.verified = True
        record.save(update_fields=["attempts", "verified"])
        return True

    record.save(update_fields=["attempts"])

    return False


def send_email_otp(email, otp, purpose):
    if purpose == "email_verification":
        subject = "Verify your ExpenseVault account"
        message = (
            f"Your ExpenseVault verification OTP is {otp}.\n\n"
            "This OTP expires in 10 minutes.\n"
            "If you did not create an account, ignore this email."
        )

    elif purpose == "password_reset":
        subject = "ExpenseVault password reset OTP"
        message = (
            f"Your ExpenseVault password reset OTP is {otp}.\n\n"
            "This OTP expires in 10 minutes."
        )

    else:
        subject = "ExpenseVault OTP"
        message = (
            f"Your ExpenseVault OTP is {otp}.\n\n"
            "This OTP expires in 10 minutes."
        )

    send_mail(
        subject,
        message,
        None,
        [email],
        fail_silently=False,
    )


def send_sms_otp(phone, otp, purpose):
    """
    SMS provider integration will go here.

    For development we intentionally DO NOT store OTP in DB
    as plaintext.

    Later connect Twilio / MSG91 / Fast2SMS etc.
    """

    print(
        f"[SMS OTP] destination={phone} "
        f"purpose={purpose} "
        f"otp={otp}"
    )

    # Do NOT print the actual OTP in production.