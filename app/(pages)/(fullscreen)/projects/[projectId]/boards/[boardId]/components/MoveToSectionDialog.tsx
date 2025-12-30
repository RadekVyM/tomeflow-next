"use client";

import ContentDialog from "@/app/components/ContentDialog";
import { DialogState } from "@/app/types/DialogState";
import { useSections, useUpdateItemPosition } from "./hooks";
import Button from "@/app/components/input/Button";
import Skeleton from "@/app/components/skeleton/Skeleton";

export default function MoveToSectionDialog(props: {
    state: DialogState,
    boardId: string,
    itemId: string,
    currentSectionId: string,
}) {
    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            className="max-w-sm"
            heading="Move to">
            <Content
                dialogState={props.state}
                boardId={props.boardId}
                itemId={props.itemId}
                currentSectionId={props.currentSectionId} />
        </ContentDialog>
    );
}

function Content(props: {
    dialogState: DialogState,
    boardId: string,
    itemId: string,
    currentSectionId: string,
}) {
    const { data: sections, isPending } = useSections(props.boardId);
    const { mutate: updateItemPosition } = useUpdateItemPosition(props.boardId);
    const otherSections = sections?.filter((s) => s.id !== props.currentSectionId);

    if (isPending) {
        return (
            <ContentSkeleton />
        );
    }

    if (!otherSections || otherSections.length === 0) {
        return (
            <div
                className="w-full my-4 text-on-surface-container-muted text-sm text-center">
                No sections found
            </div>
        );
    }

    return (
        <ul
            className="divide-y divide-outline-variant">
            {otherSections.map((section) => 
                <li
                    key={section.id}
                    className="py-0.5">
                    <Button
                        className="w-full"
                        onClick={async () => {
                            updateItemPosition({ itemId: props.itemId, targetSectionId: section.id, position: 0 });
                            await props.dialogState.hide();
                        }}>
                        {section.title}
                    </Button>
                </li>)}
        </ul>
    );
}

function ContentSkeleton() {
    return (
        <ul
            className="divide-y divide-outline-variant">
            {new Array(2).fill(null).map((_, index) =>
                <li
                    key={index}
                    className="py-0.5">
                    <Skeleton
                        className="h-8 rounded-lg" />
                </li>)}
        </ul>
    );
}