import Button from "@/app/components/input/Button";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import NewProjectButtonSkeleton from "@/app/components/skeleton/NewProjectButtonSkeleton";
import ItemsSectionSkeleton from "./components/ItemsSectionSkeleton";
import TimeSkeleton from "@/app/components/skeleton/TimeSkeleton";

export default function Loading() {
    return (
        <>
            <TimeSkeleton
                className="mb-8" />

            <div
                className="flex justify-between items-start mb-4">
                <h2
                    className="font-semibold text-2xl">
                    Recent projects
                </h2>

                <div
                    className="flex gap-2">
                    <NewProjectButtonSkeleton
                        size="sm" />
                    <Button
                        variant="container"
                        size="sm"
                        disabled>
                        All projects
                    </Button>
                </div>
            </div>

            <CardListSkeleton className="mb-8" withIcon itemsCount={3} />

            <ItemsSectionSkeleton headingClassName="max-w-48" itemsCount={2} />

            <ItemsSectionSkeleton headingClassName="max-w-56" itemsCount={5} />
        </>
    );
}