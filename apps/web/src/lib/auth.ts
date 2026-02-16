import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare } from 'bcryptjs';

export async function authorizeUser(credentials: Record<"email" | "password", string> | undefined) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (user && await compare(credentials.password, user.password)) {
    return { id: user.id, name: user.name, email: user.email };
  }

  return null;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeUser(credentials);
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger: _trigger, session: _session }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        
        // Fetch fresh user data from DB to get avatar and other fields
        // This avoids storing large base64 strings in the session cookie
        const user = await prisma.user.findUnique({ 
          where: { id: token.id } 
        });
        
        if (user) {
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.image = user.avatar;
          session.user.addressLine1 = user.addressLine1;
          session.user.addressLine2 = user.addressLine2;
          session.user.city = user.city;
          session.user.state = user.state;
          session.user.zipCode = user.zipCode;
          session.user.country = user.country;
          session.user.phoneNumber = user.phoneNumber;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
