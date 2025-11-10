"use client"

import { useEffect, useRef, useState } from "react";
import ContentDialog from "./ContentDialog";
import useDialog from "../hooks/useDialog";
import Button from "./input/Button";

const REQUEST_CONFIRM_EVENT_KEY = "confirm-dialog-request";
const RESULT_CONFIRM_EVENT_KEY = "confirm-dialog-result";

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface WindowEventMap {
        "confirm-dialog-request": ConfirmDialogRequestEvent,
        "confirm-dialog-result": ConfirmDialogResultEvent,
    }
}

class ConfirmDialogRequestEvent extends CustomEvent<unknown> {
    dialogId: string;
    title: string;
    content?: React.ReactNode;
    confirmButton?: string;
    isDestructive?: boolean;

    constructor(
        dialogId: string,
        title: string,
        content?: React.ReactNode,
        confirmButton?: string,
        isDestructive?: boolean,
    ) {
        super(REQUEST_CONFIRM_EVENT_KEY);

        this.dialogId = dialogId;
        this.title = title;
        this.content = content;
        this.confirmButton = confirmButton;
        this.isDestructive = isDestructive;
    }
}

class ConfirmDialogResultEvent extends CustomEvent<unknown> {
    dialogId: string;
    result: boolean;

    constructor(
        dialogId: string,
        result: boolean,
    ) {
        super(RESULT_CONFIRM_EVENT_KEY);

        this.dialogId = dialogId;
        this.result = result;
    }
}

type ConfirmDialogState = {
    dialogId: string,
    title: string,
    content?: React.ReactNode,
    confirmButton?: string,
    isDestructive?: boolean,
    sendResult: (result: boolean) => void
}

export async function confirm(
    title: string,
    content?: React.ReactNode,
    confirmButton?: string,
    isDestructive?: boolean,
): Promise<boolean> {
    return new Promise((resolve) => {
        const dialogId = Math.random().toString();

        const handleResult = (e: ConfirmDialogResultEvent) => {
            if (dialogId !== e.dialogId) {
                return;
            }

            resolve(e.result);
            window.removeEventListener(RESULT_CONFIRM_EVENT_KEY, handleResult);
        };

        window.dispatchEvent(new ConfirmDialogRequestEvent(dialogId, title, content, confirmButton, isDestructive));
        window.addEventListener(RESULT_CONFIRM_EVENT_KEY, handleResult);
    });
}

export function ConfirmDialogs() {
    // All confirm dialogs that are currently opened
    const [dialogs, setDialogs] = useState<Array<ConfirmDialogState>>([]);

    useEffect(() => {
        const handleRequest = (e: ConfirmDialogRequestEvent) => {
            const sendResult = (result: boolean) => {
                window.dispatchEvent(new ConfirmDialogResultEvent(e.dialogId, result));
                setDialogs((old) => old.filter((d) => d.dialogId !== e.dialogId));
            };

            setDialogs((old) => [...old, {
                dialogId: e.dialogId,
                title: e.title,
                content: e.content,
                confirmButton: e.confirmButton,
                isDestructive: e.isDestructive,
                sendResult: sendResult
            }]);
        };

        window.addEventListener(REQUEST_CONFIRM_EVENT_KEY, handleRequest);

        return () => window.removeEventListener(REQUEST_CONFIRM_EVENT_KEY, handleRequest);
    }, []);

    return (
        <>
            {dialogs.map((dialog) =>
                <ConfirmDialog
                    key={dialog.dialogId}
                    state={dialog} />)}
        </>
    );
}

function ConfirmDialog(props: {
    state: ConfirmDialogState,
}) {
    const dialogState = useDialog();
    const wasOpenRef = useRef<boolean>(false);

    useEffect(() => {
        // When the dialog is rendered, it is immediately opened
        dialogState.show().then();
    }, []);

    useEffect(() => {
        if (dialogState.isOpen) {
            wasOpenRef.current = true;
        }

        // If the dialog is closed, send falsy result
        if (wasOpenRef.current && !dialogState.isOpen) {
            props.state.sendResult(false);
        }
    }, [dialogState.isOpen]);

    return (
        <ContentDialog
            ref={dialogState.dialogRef}
            state={dialogState}
            heading={props.state.title}
            className="max-w-md">
            <div
                className="flex flex-col gap-4 mt-3">
                {props.state.content && <p>{props.state.content}</p>}
                
                <div
                    className="flex self-end gap-2">
                    <Button
                        onClick={async () => await dialogState.hide()}
                        variant="container">
                        Cancel
                    </Button>

                    <Button
                        onClick={async () => {
                            await dialogState.hide();
                            props.state.sendResult(true);
                        }}
                        variant={props.state.isDestructive ? "destructive" : "primary"}>
                        {props.state.confirmButton || "Do it!"}
                    </Button>
                </div>
            </div>
        </ContentDialog>
    );
}