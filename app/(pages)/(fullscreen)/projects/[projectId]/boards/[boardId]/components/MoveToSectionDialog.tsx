"use client";

import ContentDialog from "@/app/components/ContentDialog";
import { DialogState } from "@/app/types/DialogState";
import { useSections, useUpdateItemPosition } from "./hooks";
import Button from "@/app/components/input/Button";

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
    const { data: sections } = useSections(props.boardId);
    const { mutate: updateItemPosition } = useUpdateItemPosition(props.boardId);

    if (!sections) {
        return undefined;
    }

    return (
        <ul
            className="divide-y divide-outline-variant">
            {sections.filter((s) => s.id !== props.currentSectionId).map((section) => 
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