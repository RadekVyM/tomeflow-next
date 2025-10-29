// @ts-nocheck
import { useGoogleLogin } from "@react-oauth/google";
import { signIn } from "../services/auth";
import Button from "./Button";
import GoogleLogo from "../assets/g.webp";
import Image from "next/image";

export default function SignInButton() {
    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            try {
                await signIn(codeResponse.code);
            } catch (error) {
                console.error(error);
            }
        },
        onError: (error) => console.error("Login Failed:", error),
        flow: "auth-code",
    });

    return (
        <Button
            className="rounded-full pr-3"
            variant="container"
            size="lg"
            onClick={login}>
            <Image
                className="h-6 w-6"
                src={GoogleLogo}
                aria-hidden
                alt={"Google logo"} /> Sign in with google
        </Button>
    );
}