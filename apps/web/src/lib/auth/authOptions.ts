import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? "",
            avatarUrl: user.image ?? null,
            provider: account.provider,
            providerId: account.providerAccountId,
          },
          create: {
            email: user.email,
            name: user.name ?? "",
            avatarUrl: user.image ?? null,
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        });
      } catch {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        token.id = dbUser?.id ?? user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const secret = new TextEncoder().encode(
          process.env.NEXTAUTH_SECRET ?? ""
        );
        session.apiToken = await new SignJWT({ userId: token.id })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("24h")
          .sign(secret);
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
