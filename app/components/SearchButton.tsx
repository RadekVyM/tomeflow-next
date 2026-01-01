"use client";

import { LuSearch } from "react-icons/lu";
import Button from "./input/Button";
import SearchDialog from "./SearchDialog";
import useDialog from "../hooks/useDialog";
import { useEventListener } from "../hooks/useEventListener";
import { isEditableElement } from "../utils/html";

export default function SearchButton(props: {
    className?: string,
}) {
    const dialogState = useDialog();

    useEventListener("keydown", async (e) => {
        if (window.document.activeElement && isEditableElement(window.document.activeElement)) {
            return;
        }

        if (e.key.toLowerCase() === "f") {
            e.preventDefault();
            await dialogState.show();
        }
    });

    return (
        <>
            <Button
                className={props.className}
                variant="icon-container"
                title="Find..."
                onClick={dialogState.show}>
                <LuSearch />
            </Button>

            <SearchDialog
                state={dialogState} />
        </>
    );
}