"use client";

import GoogleLogo from "../assets/g.webp";
import Image from "next/image";
import { signInAction } from "@/app/actions/auth";
import { useAction } from "next-safe-action/hooks";
import Button from "./input/Button";
import toast from "./toast";

export default function SignInButton() {
    const action = useAction(signInAction, {
        onError: () => toast("Failed to sign in"),
    });

    return (
        <form
            className="flex flex-col items-center gap-2"
            onSubmit={async (e) => {
                e.preventDefault();
                action.execute();
            }}>
            <Button
                className="rounded-full pr-3"
                variant="container"
                size="lg"
                type="submit"
                disabled={action.isPending}>
                <Image
                    className="h-6 w-6"
                    src={GoogleLogo}
                    aria-hidden
                    alt={"Google logo"} /> Sign in with Google
            </Button>
            {action.hasErrored &&
                <>
                    <p className="text-sm text-danger">{action.result.serverError}</p>
                </>}
        </form>
    );
}