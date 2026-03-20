import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/auth",
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                const envAllowedIds = process.env.ALLOWED_GOOGLE_IDS;

                if (!envAllowedIds) {
                    console.error("ALLOWED_GOOGLE_IDS is not configured");
                    return false;
                }

                const allowedIds = envAllowedIds
                    .split(",")
                    .map(id => id.trim())
                    .filter(id => id.length > 0);

                if (allowedIds.length === 0) {
                    console.error("ALLOWED_GOOGLE_IDS is empty after parsing");
                    return false;
                }

                const userGoogleId = profile?.sub;

                if (userGoogleId && allowedIds.includes(userGoogleId)) {
                    return true;
                }

                console.warn(`Unauthorized Google ID attempted sign-in: ${userGoogleId}`);
            }

            return false;
        },
        async authorized({ auth, request }) {
            const protectedPaths = ["/api/projects", "/api/search", "/projects"];

            const isUploadImageRoute = request.nextUrl.pathname === "/api/projects/images/upload";
            const hasVercelSignature = request.headers.has("x-vercel-signature");

            // Bypass Auth.js if it's a signed Vercel webhook
            if (isUploadImageRoute && hasVercelSignature) {
                return true; 
            }

            const isProtected = protectedPaths.some(path => 
                request.nextUrl.pathname.startsWith(path));

            return isProtected ? !!auth?.user : true;
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