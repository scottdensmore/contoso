import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      avatar?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      phoneNumber?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    avatar?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phoneNumber?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    avatar?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phoneNumber?: string;
  }
}