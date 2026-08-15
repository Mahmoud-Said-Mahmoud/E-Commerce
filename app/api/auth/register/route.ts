
import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =========================================================
   WOOCOMMERCE CONFIG
========================================================= */

const WC_URL =
  process.env.WC_URL;

const WC_KEY =
  process.env.WC_KEY;

const WC_SECRET =
  process.env.WC_SECRET;

/* =========================================================
   TYPES
========================================================= */

interface RegisterBody {
  firstName: string;
  lastName: string;

  email: string;
  username?: string;

  phone: string;

  country: string;
  governorate: string;
  city: string;
  district: string;
  street: string;

  buildingNumber: string;
  floor: string;
  apartment: string;

  postalCode?: string;

  addressLabel:
    | "Home"
    | "Work";

  password: string;
  confirmPassword?: string;
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =====================================================
       CHECK ENV
    ===================================================== */

    if (
      !WC_URL ||
      !WC_KEY ||
      !WC_SECRET
    ) {
      console.error(
        "WooCommerce environment variables are missing."
      );

      return NextResponse.json(
        {
          message:
            "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       BODY
    ===================================================== */

    const body =
      (await request.json()) as RegisterBody;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.password ||
      !body.phone
    ) {
      return NextResponse.json(
        {
          message:
            "Please fill in all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       PASSWORD
    ===================================================== */

    if (
      body.password.length < 8
    ) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       WOOCOMMERCE AUTH
    ===================================================== */

    const credentials =
      Buffer.from(
        `${WC_KEY}:${WC_SECRET}`
      ).toString(
        "base64"
      );

    /* =====================================================
       CHECK EXISTING EMAIL
    ===================================================== */

    const existingCustomerResponse =
      await fetch(
        `${WC_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(
          body.email
        )}`,
        {
          method: "GET",

          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type":
              "application/json",
          },

          cache: "no-store",
        }
      );

    if (
      !existingCustomerResponse.ok
    ) {
      const errorText =
        await existingCustomerResponse.text();

      console.error(
        "WooCommerce customer lookup error:",
        errorText
      );

      return NextResponse.json(
        {
          message:
            "Unable to verify your email. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    const existingCustomers =
      await existingCustomerResponse.json();

    if (
      Array.isArray(
        existingCustomers
      ) &&
      existingCustomers.length > 0
    ) {
      return NextResponse.json(
        {
          message:
            "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       USERNAME
    ===================================================== */

    const username =
      body.username?.trim() ||
      body.email
        .split("@")[0]
        .replace(
          /[^a-zA-Z0-9_.-]/g,
          ""
        )
        .slice(0, 30);

    /* =====================================================
       FULL ADDRESS
       
       WooCommerce has:
       address_1
       address_2
       city
       state
       postcode
       country
       
       We combine the detailed Egyptian
       address into address_1 / address_2
       and additionally save everything
       as custom meta data.
    ===================================================== */

    const address1 = [
      body.street,
      body.buildingNumber
        ? `Building ${body.buildingNumber}`
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    const address2 = [
      body.district
        ? body.district
        : "",

      body.floor
        ? `Floor ${body.floor}`
        : "",

      body.apartment
        ? `Apartment ${body.apartment}`
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    /* =====================================================
       BILLING
    ===================================================== */

    const billing = {
      first_name:
        body.firstName,

      last_name:
        body.lastName,

      company: "",

      address_1:
        address1,

      address_2:
        address2,

      city:
        body.city,

      state:
        body.governorate,

      postcode:
        body.postalCode ||
        "",

      country:
        body.country,

      email:
        body.email,

      phone:
        body.phone,
    };

    /* =====================================================
       SHIPPING
    ===================================================== */

    const shipping = {
      first_name:
        body.firstName,

      last_name:
        body.lastName,

      company: "",

      address_1:
        address1,

      address_2:
        address2,

      city:
        body.city,

      state:
        body.governorate,

      postcode:
        body.postalCode ||
        "",

      country:
        body.country,
    };

    /* =====================================================
       CREATE CUSTOMER
    ===================================================== */

    const customerResponse =
      await fetch(
        `${WC_URL}/wp-json/wc/v3/customers`,
        {
          method: "POST",

          headers: {
            Authorization: `Basic ${credentials}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,

            password:
              body.password,

            email:
              body.email,

            first_name:
              body.firstName,

            last_name:
              body.lastName,

            billing,

            shipping,

            /* =========================================
               EXTRA ADDRESS DATA
            ========================================= */

            meta_data: [
              {
                key:
                  "phone",
                value:
                  body.phone,
              },

              {
                key:
                  "governorate",
                value:
                  body.governorate,
              },

              {
                key:
                  "city",
                value:
                  body.city,
              },

              {
                key:
                  "district",
                value:
                  body.district,
              },

              {
                key:
                  "street",
                value:
                  body.street,
              },

              {
                key:
                  "building_number",
                value:
                  body.buildingNumber,
              },

              {
                key:
                  "floor",
                value:
                  body.floor,
              },

              {
                key:
                  "apartment",
                value:
                  body.apartment,
              },

              {
                key:
                  "postal_code",
                value:
                  body.postalCode ||
                  "",
              },

              {
                key:
                  "address_label",
                value:
                  body.addressLabel,
              },
            ],
          }),

          cache: "no-store",
        }
      );

    /* =====================================================
       WOOCOMMERCE ERROR
    ===================================================== */

    if (
      !customerResponse.ok
    ) {
      const error =
        await customerResponse.json();

      console.error(
        "WooCommerce registration error:",
        error
      );

      let message =
        "Unable to create your account.";

      if (
        error?.code ===
        "registration-error-email-exists"
      ) {
        message =
          "An account with this email already exists.";
      }

      if (
        error?.code ===
        "registration-error-username-exists"
      ) {
        message =
          "This username is already taken.";
      }

      if (
        error?.message
      ) {
        message =
          error.message;
      }

      return NextResponse.json(
        {
          message,
        },
        {
          status:
            customerResponse.status ||
            400,
        }
      );
    }

    /* =====================================================
       CUSTOMER CREATED
    ===================================================== */

    const customer =
      await customerResponse.json();

    return NextResponse.json(
      {
        success: true,

        message:
          "Account created successfully!",

        customer: {
          id:
            customer.id,

          email:
            customer.email,

          firstName:
            customer.first_name,

          lastName:
            customer.last_name,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Register API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating your account.",
      },
      {
        status: 500,
      }
    );
  }
}

