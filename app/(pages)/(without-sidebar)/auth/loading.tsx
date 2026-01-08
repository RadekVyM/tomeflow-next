import LoadingView from "@/app/components/LoadingView";

export default function Loading() {
    return (
        <div
            className="grid w-full h-full min-h-dvh flex-1 place-content-center">
            <LoadingView />
        </div>
    );
}