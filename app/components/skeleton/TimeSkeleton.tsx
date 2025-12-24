import Skeleton from "./Skeleton";

export default function TimeSkeleton(props: {
    className?: string,
}) {
    return (
        <div
            className={props.className}>
            <div
                className="font-bold text-6xl">
                <Skeleton className="inline-block w-15" />:
                <Skeleton className="inline-block w-15" />
                <span
                    className="text-4xl">
                    :<Skeleton className="inline-block w-10" />
                </span>
            </div>
            <div
                className="font-semibold text-xl text-on-surface-muted -mb-2.5">
                <Skeleton className="inline-block w-30" />
            </div>
        </div>
    );
}