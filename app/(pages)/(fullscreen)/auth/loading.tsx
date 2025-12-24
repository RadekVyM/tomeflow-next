import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function Loading() {
    return (
        <div
            className="grid w-full h-full min-h-dvh flex-1 place-content-center">
            <LoadingSpinner />
        </div>
    );
}