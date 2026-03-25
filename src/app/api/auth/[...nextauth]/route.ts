import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const [users]: any = await pool.execute(
          "SELECT id, email, password, name, phone, role, status FROM User WHERE email = ? AND status = 'ACTIVE'",
          [credentials.email]
        );


        if (users.length === 0) {
          throw new Error("No user found with this email");
        }

        const user = users[0];

        if (user.status === "REVOKED") {
          throw new Error("Access Denied: Your account has been revoked.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Return user with role and status for the JWT callback
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          status: user.status
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.sub = (user as any).id; // Map id to sub for standard access
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub; // Try both
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).status = token.status;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      const role = (token as any)?.role || "GUEST";

      // If the user just signed in, send to their specific dashboard
      if (url === baseUrl || url.startsWith(baseUrl + "/login")) {
        if (role === "CUSTOMER") {
          return `${baseUrl}/dashboard/guest`;
        } else if (role === "ADMIN" || role === "RECEPTIONIST") {
          return `${baseUrl}/dashboard/staff`;
        }
        return `${baseUrl}/dashboard`;
      }
      return url;
    }

  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt"
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
