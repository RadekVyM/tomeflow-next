import Skeleton from "./Skeleton";

export default function TimeSkeleton(props: {
    className?: string,
}) {
    return (
        <div
            className={props.className}>
            <Skeleton
                className="font-bold text-6xl max-w-48 mb-1" />
            <Skeleton
                className="font-semibold text-xl max-w-28 mb-1" />
        </div>
    );
}