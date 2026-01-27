"use client";

import { cn } from "@/app/utils/tailwind";
import Button from "../../input/Button";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { useEffect } from "react";
import { User } from "next-auth";
import useDialog from "@/app/hooks/useDialog";
import MobileMenuDialog from "./MobileMenuDialog";

export default function UserButtonClient(props: {
    className?: string,
    children?: React.ReactNode,
    user: User,
}) {
    const dialogState = useDialog();
    const isLarge = useMediaQuery("(width >= 40rem)");

    useEffect(() => {
        if (!isLarge) {
            const popover = getUserInfoPopover();
            popover?.hidePopover();
        }
        else {
            dialogState.hide();
        }
    }, [isLarge]);

    return (
        <>
            <Button
                className={cn("p-1 rounded-2xl", props.className)}
                onClick={() => {
                    if (isLarge) {
                        const popover = getUserInfoPopover();

                        if (popover?.checkVisibility()) {
                            popover.hidePopover();
                        }
                        else {
                            popover?.showPopover();
                        }
                    }
                    else {
                        dialogState.show();
                    }
                }}>
                {props.children}
            </Button>

            <MobileMenuDialog
                state={dialogState}
                user={props.user} />
        </>
    );
}

function getUserInfoPopover() {
    return document.getElementById("userinfo-popover");
}