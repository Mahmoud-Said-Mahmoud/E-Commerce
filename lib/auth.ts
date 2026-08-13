import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const WC_URL = process.env.WC_URL;
const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        console.log("LOGIN ATTEMPT");

        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          console.log("Missing email/password");
          return null;
        }

        try {
          /*
           * 1. Get WordPress/WooCommerce user
           * by email.
           */
          const userResponse = await fetch(
            `${WC_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(
              String(credentials.email)
            )}`,
            {
              method: "GET",
              headers: {
                Authorization:
                  "Basic " +
                  Buffer.from(
                    `${WC_KEY}:${WC_SECRET}`
                  ).toString("base64"),
              },

              cache: "no-store",
            }
          );

          console.log(
            "USER RESPONSE:",
            userResponse.status
          );

          /*
           * IMPORTANT:
           *
           * Do not use the user endpoint
           * to verify password.
           *
           * Password verification should happen
           * through your JWT authentication endpoint.
           */

          const loginResponse = await fetch(
            `${WC_URL}/wp-json/jwt-auth/v1/token`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                username: String(credentials.email),
                password: String(credentials.password),
              }),

              cache: "no-store",
            }
          );

          const loginData =
            await loginResponse.json();

          console.log(
            "JWT STATUS:",
            loginResponse.status
          );

          console.log(
            "JWT RESPONSE:",
            loginData
          );

          if (!loginResponse.ok) {
            console.log(
              "JWT LOGIN FAILED:",
              loginData
            );

            return null;
          }

          /*
           * JWT plugin normally returns:
           *
           * token
           * user_email
           * user_nicename
           * user_display_name
           */

          if (!loginData?.token) {
            console.log(
              "No JWT token returned"
            );

            return null;
          }

          /*
           * Get actual WP user ID.
           *
           * WordPress JWT response does not always
           * return the ID, so get it separately.
           */

          const meResponse = await fetch(
            `${WC_URL}/wp-json/wp/v2/users/me`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${loginData.token}`,
              },

              cache: "no-store",
            }
          );

          let meData = null;

          if (meResponse.ok) {
            meData =
              await meResponse.json();
          }

          console.log(
            "USER DATA:",
            meData
          );

          /*
           * Build NextAuth user
           */

          return {
            id: String(
              meData?.id ||
                loginData?.user_email ||
                credentials.email
            ),

            name:
              meData?.name ||
              loginData?.user_display_name ||
              String(credentials.email).split("@")[0],

            email:
              meData?.email ||
              loginData?.user_email ||
              String(credentials.email),

            /*
             * Keep WooCommerce/WordPress JWT
             * inside the user object.
             */
            accessToken: loginData.token,
          };
        } catch (error) {
          console.error(
            "AUTHORIZE ERROR:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;

        /*
         * Save WooCommerce/WordPress JWT
         */
        token.accessToken = (
          user as {
            accessToken?: string;
          }
        ).accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(
          token.id || ""
        );

        session.user.name =
          String(token.name || "");

        session.user.email =
          String(token.email || "");

        /*
         * You can use this later
         * to fetch cart/orders/wishlist.
         */
        (
          session as typeof session & {
            accessToken?: string;
          }
        ).accessToken =
          String(
            token.accessToken || ""
          );
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});