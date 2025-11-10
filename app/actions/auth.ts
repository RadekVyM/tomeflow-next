"use server"

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { noauthActionClient } from "./safe-actions";

export const signInAction = noauthActionClient.action(async () => {
    try {
        await signIn("google");
        revalidatePath("/");
    }
    catch (error) {
        if (error instanceof AuthError) {
            console.log(error.message);
            switch (error.type) {
                case "OAuthSignInError":
                    throw new Error("Failed to sign in.");
            }

            throw new Error("Something went wrong during the sign in process.");
        }
        throw error;
    }
});

export const signOutAction = noauthActionClient.action(async () => {
    try {
        await signOut({ redirectTo: "/" });
        revalidatePath("/");
    }
    catch (error) {
        if (error instanceof AuthError) {
            console.log(error.message);
            switch (error.type) {
                case "SignOutError":
                    throw new Error("Failed to sign out.");
            }

            throw new Error("Something went wrong during the sign out process.");
        }
        throw error;
    }
});