"use client";

import useIsClient from "@/app/hooks/useIsClient";
import { DialogState } from "@/app/types/DialogState";
import ContentDialog from "../ContentDialog";

export default function BaseImagesDialog(props: {
    state: DialogState,
    children?: React.ReactNode,
}) {
    const isClient = useIsClient();

    if (!isClient) {
        return undefined;
    }

    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            heading="Images"
            className="max-w-5xl max-h-full overflow-hidden px-0 pb-0"
            headerClassName="px-5">
            {props.state.isOpen && props.children}
        </ContentDialog>
    );
}

