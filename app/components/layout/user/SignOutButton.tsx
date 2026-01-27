"use client";

import { useAction } from "next-safe-action/hooks";
import toast from "../../toast";
import { signOutAction } from "@/app/actions/auth";
import Button from "../../input/Button";
import { TbLogout } from "react-icons/tb";

export default function SignOutButton(props: {
    className?: string,
}) {
    const signOut = useAction(signOutAction, {
        onError: () => toast("Failed to sign out"),
    });

    return (
        <Button
            className={props.className}
            size="sm"
            type="submit"
            variant="secondary"
            onClick={() => signOut.execute()}
            disabled={signOut.isPending}>
            <TbLogout /> Sign out
        </Button>
    );
}