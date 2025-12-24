import { LuUser } from "react-icons/lu";
import { cn } from "../../utils/tailwind";
import Image from "next/image";
import UserInfoPopover from "./UserInfoPopover";
import Button from "../input/Button";
import { getSessionCached } from "@/app/utils/session";
import { Suspense } from "react";

export default async function Header(props: {
    className?: string,
    children?: React.ReactNode,
    withFallbackUserButton?: boolean,
}) {
    return (
        <header
            className={cn("px-4 py-2 grid grid-cols-[calc(100%-var(--spacing)*12)_auto] items-start pointer-events-none z-10", props.className)}>
            <div
                className="pointer-events-auto">
                {props.children}
            </div>
            {props.withFallbackUserButton ?
                <FallbackUserButton /> :
                <Suspense
                    fallback={
                        <FallbackUserButton />}>
                    <SuspendedUserButton />
                </Suspense>}
        </header>
    );
}

async function SuspendedUserButton() {
    const session = await getSessionCached();

    return (
        <>
            <Button
                className="p-1 rounded-full pointer-events-auto justify-self-end"
                popoverTarget="userinfo-popover">
                {session.user.image ?
                    <Image
                        className="w-9 h-9 rounded-full"
                        width={128}
                        height={128}
                        src={session.user.image}
                        alt="Profile picture" /> :
                    <div
                        className="w-9 h-9 rounded-full bg-primary grid place-content-center">
                        <LuUser
                            className="text-on-primary w-5 h-5" />
                    </div>}
            </Button>
            <UserInfoPopover
                userInfo={session.user} />
        </>
    );
}

function FallbackUserButton() {
    return (
        <Button
            className="p-1 rounded-full pointer-events-auto justify-self-end"
            popoverTarget="userinfo-popover">
            <div
                className="w-9 h-9 rounded-full bg-primary grid place-content-center">
                <LuUser
                    className="text-on-primary w-5 h-5" />
            </div>
        </Button>
    );
}