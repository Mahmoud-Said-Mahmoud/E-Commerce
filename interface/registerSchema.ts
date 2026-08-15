
import { z } from "zod";

export const registerSchema = z
  .object({
    /* =====================================================
       ACCOUNT
    ===================================================== */

    firstName: z
      .string()
      .trim()
      .min(
        2,
        "First name must be at least 2 characters."
      )
      .max(
        50,
        "First name is too long."
      ),

    lastName: z
      .string()
      .trim()
      .min(
        2,
        "Last name must be at least 2 characters."
      )
      .max(
        50,
        "Last name is too long."
      ),

    email: z
      .string()
      .trim()
      .email(
        "Please enter a valid email address."
      ),

    username: z
      .string()
      .trim()
      .min(
        3,
        "Username must be at least 3 characters."
      )
      .max(
        30,
        "Username is too long."
      )
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "Username can only contain letters, numbers, dots, hyphens and underscores."
      )
      .or(z.literal("")),

    phone: z
      .string()
      .trim()
      .regex(
        /^(?:\+20|0020|0)?1[0125][0-9]{8}$/,
        "Please enter a valid Egyptian phone number."
      ),

    /* =====================================================
       ADDRESS
    ===================================================== */

    country: z
      .string()
      .min(
        2,
        "Please select your country."
      ),

    governorate: z
      .string()
      .trim()
      .min(
        2,
        "Governorate is required."
      )
      .max(
        100,
        "Governorate is too long."
      ),

    city: z
      .string()
      .trim()
      .min(
        2,
        "City is required."
      )
      .max(
        100,
        "City is too long."
      ),

    district: z
      .string()
      .trim()
      .min(
        2,
        "Area / District is required."
      )
      .max(
        100,
        "Area / District is too long."
      ),

    street: z
      .string()
      .trim()
      .min(
        2,
        "Street address is required."
      )
      .max(
        200,
        "Street address is too long."
      ),

    buildingNumber: z
      .string()
      .trim()
      .min(
        1,
        "Building number is required."
      )
      .max(
        30,
        "Building number is too long."
      ),

    floor: z
      .string()
      .trim()
      .min(
        1,
        "Floor is required."
      )
      .max(
        20,
        "Floor is too long."
      ),

    apartment: z
      .string()
      .trim()
      .min(
        1,
        "Apartment number is required."
      )
      .max(
        30,
        "Apartment number is too long."
      ),

    postalCode: z
      .string()
      .trim()
      .regex(
        /^[0-9]{5}$/,
        "Postal code must contain 5 digits."
      )
      .or(z.literal("")),

    addressLabel: z.enum([
      "Home",
      "Work",
    ]),

    /* =====================================================
       PASSWORD
    ===================================================== */

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters."
      )
      .max(
        100,
        "Password is too long."
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your password."
      ),
  })

  /* =======================================================
     PASSWORD MATCH
  ======================================================= */

  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords do not match.",
      path: [
        "confirmPassword",
      ],
    }
  );

export type RegisterFormValues =
  z.infer<
    typeof registerSchema
  >;

