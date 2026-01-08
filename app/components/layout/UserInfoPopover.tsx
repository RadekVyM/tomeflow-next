"use client";

import { signOutAction } from "@/app/actions/auth";
import { User } from "next-auth";
import { LuLogOut } from "react-icons/lu";
import { useAction } from "next-safe-action/hooks";
import Button from "../input/Button";
import toast from "../toast";

export default function UserInfoPopover(props: {
    userInfo: User,
}) {
    const signOut = useAction(signOutAction, {
        onError: () => toast("Failed to sign out"),
    });

    return (
        <article
            className="pointer-events-auto slide-down-popover-transition open:fixed inset-[unset] sm:left-2 right-3 sm:right-auto top-13 sm:top-14 bg-surface-container rounded-xl border border-outline-variant px-4 py-3 w-full max-w-[min(calc(100vw-(var(--spacing)*8)),16rem)]"
            id="userinfo-popover"
            popover="auto">
            <div
                className="flex flex-col">
                <h2
                    className="font-semibold text-lg">
                    {props.userInfo.name}
                </h2>
                <small
                    className="text-on-surface-container-muted mb-1">
                    {props.userInfo.email}
                </small>

                <Button
                    className="self-end"
                    size="sm"
                    type="submit"
                    onClick={() => signOut.execute()}
                    disabled={signOut.isPending}>
                    <LuLogOut /> Sign out
                </Button>
            </div>
        </article>
    );
}