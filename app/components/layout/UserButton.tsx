import { getSessionCached } from "@/app/utils/session";
import { Suspense } from "react";
import Button from "../input/Button";
import { LuUser } from "react-icons/lu";
import Image from "next/image";
import UserInfoPopover from "./UserInfoPopover";

export default function UserButton(props: {
    withFallback?: boolean,
}) {
    return props.withFallback ?
        <FallbackUserButton /> :
        <Suspense
            fallback={
                <FallbackUserButton />}>
            <SuspendedUserButton />
        </Suspense>;
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