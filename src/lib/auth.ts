import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,   // 7 days absolute max
    updateAge: 24 * 60 * 60,     // refresh token once per day
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        biometricUserId: { label: "Biometric User ID", type: "text" },
      },

      async authorize(credentials) {
        // ── Biometric path ──────────────────────────────────────────
        // User already verified by WebAuthn API route before reaching here.
        // We just look up the user by ID and return them.
        if (credentials?.biometricUserId) {
          const user = await prisma.user.findUnique({
            where: { id: credentials.biometricUserId as string },
          });

          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            authMethod: "biometric",
          };
        }

        // ── Password path ───────────────────────────────────────────
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authMethod: "password",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // ── On first sign-in, populate token from user object ────────
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.authMethod = (user as any).authMethod ?? "password";
        token.lastActivity = Date.now();
        return token;
      }

      // ── Idle timeout check on every subsequent request ───────────
      const lastActivity = token.lastActivity as number | undefined;

      if (!lastActivity || Date.now() - lastActivity > IDLE_TIMEOUT) {
        // Returning an empty token forces NextAuth to treat the
        // session as expired and sign the user out.
        return {};
      }

      // Still active — refresh the activity timestamp
      token.lastActivity = Date.now();
      return token;
    },

    async session({ session, token }) {
      // Empty token means session was invalidated by idle timeout
      if (!token.id) {
        return {
          ...session,
          user: undefined,
          expires: new Date(0).toISOString(),
        };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).authMethod = token.authMethod;
      }

      return session;
    },
  },
});
