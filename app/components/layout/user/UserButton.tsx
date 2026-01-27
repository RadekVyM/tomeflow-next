import { getSessionCached } from "@/app/utils/session";
import { Suspense } from "react";
import Button from "../../input/Button";
import { TbUser } from "react-icons/tb";
import Image from "next/image";
import UserInfoPopover from "./UserInfoPopover";
import { cn } from "@/app/utils/tailwind";
import UserButtonClient from "./UserButtonClient";

export default function UserButton(props: {
    withFallback?: boolean,
    className?: string,
}) {
    return props.withFallback ?
        <FallbackUserButton /> :
        <Suspense
            fallback={
                <FallbackUserButton
                    className={props.className} />}>
            <SuspendedUserButton
                className={props.className} />
        </Suspense>;
}

async function SuspendedUserButton(props: {
    className?: string,
}) {
    const session = await getSessionCached();

    return (
        <>
            <UserButtonClient
                className={props.className}
                user={session.user}>
                {session.user.image ?
                    <Image
                        className="w-9 h-9 rounded-xl"
                        width={128}
                        height={128}
                        src={session.user.image}
                        alt="Profile picture" /> :
                    <FallbackPicture />}
            </UserButtonClient>
            <UserInfoPopover
                userInfo={session.user} />
        </>
    );
}

function FallbackUserButton(props: {
    className?: string,
}) {
    return (
        <Button
            className={cn("p-1 rounded-xl", props.className)}
            popoverTarget="userinfo-popover">
            <FallbackPicture />
        </Button>
    );
}

function FallbackPicture() {
    return (
        <div
            className="w-9 h-9 rounded-xl bg-primary grid place-content-center">
            <TbUser
                className="text-on-primary w-5 h-5" />
        </div>
    );
}