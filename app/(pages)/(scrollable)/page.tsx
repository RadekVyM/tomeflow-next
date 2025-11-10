import Button from "@/app/components/input/Button";
import NewProjectButton from "@/app/components/project/NewProjectButton";
import SignInButton from "@/app/components/SignInButton";
import Time from "@/app/components/Time";
import { auth } from "@/auth";

export default async function Page() {
    const session = await auth();

    if (!session?.user) {
        return (
            <div
                className="grid w-full h-[100dvh] place-content-center">
                <SignInButton />
            </div>
        );
    }

    return (
        <>
            <Time
                className="mb-8" />

            <div
                className="flex justify-between items-start mb-4">
                <h2
                    className="font-semibold text-2xl">
                    Recent projects
                </h2>

                <div
                    className="flex gap-2">
                    <NewProjectButton
                        size="sm" />
                    <Button
                        href="/projects"
                        variant="container"
                        size="sm">
                        All projects
                    </Button>
                </div>
            </div>
        </>
    );
}