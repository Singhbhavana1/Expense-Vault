import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

import { auth } from "@/firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = () => {
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      recaptchaVerifier?.clear();
      recaptchaVerifier = null;
    },
  });

  return recaptchaVerifier;
};

export const sendFirebaseOTP = async (
  phone: string
): Promise<ConfirmationResult> => {
  const verifier = setupRecaptcha();

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    `+91${phone}`,
    verifier
  );

  return confirmationResult;
};

export const verifyFirebaseOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
) => {
  const result = await confirmationResult.confirm(otp);

  const firebaseToken = await result.user.getIdToken();

  return firebaseToken;
};

export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};