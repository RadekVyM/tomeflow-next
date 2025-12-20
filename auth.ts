import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                return !!profile?.email_verified // && !!profile?.email?.endsWith("@example.com");
            }
            return true;
        },
    },
    providers: [Google],
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    trustHost: true,
});