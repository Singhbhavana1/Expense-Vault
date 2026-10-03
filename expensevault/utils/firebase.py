import os

import firebase_admin
from firebase_admin import credentials, auth


def get_firebase_app():
    try:
        return firebase_admin.get_app()
    except ValueError:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

        if not service_account_path:
            raise ValueError(
                "FIREBASE_SERVICE_ACCOUNT_PATH is not configured."
            )

        credential = credentials.Certificate(service_account_path)

        return firebase_admin.initialize_app(credential)


def verify_firebase_id_token(id_token):
    get_firebase_app()
    return auth.verify_id_token(id_token)