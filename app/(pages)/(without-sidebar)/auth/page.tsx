import SignInButton from "@/app/components/SignInButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
    const session = await auth();

    if (session) {
        redirect("/");
    }

    return (
        <div
            className="grid w-full h-full min-h-dvh flex-1 place-content-center">
            <SignInButton />
        </div>
    );
}