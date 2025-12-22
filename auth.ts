import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                const envAllowedIds = process.env.ALLOWED_GOOGLE_IDS || "";
                const allowedIds = envAllowedIds.split(",").map(id => id.trim());
                const userGoogleId = profile?.sub;

                if (userGoogleId && allowedIds.includes(userGoogleId)) {
                    return true;
                }
            }
            return false;
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