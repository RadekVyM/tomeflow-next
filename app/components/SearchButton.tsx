"use client";

import { LuSearch } from "react-icons/lu";
import Button from "./input/Button";
import SearchDialog from "./SearchDialog";
import useDialog from "../hooks/useDialog";

export default function SearchButton(props: {
    className?: string,
}) {
    const dialogState = useDialog();

    return (
        <>
            <Button
                className={props.className}
                variant="icon-container"
                onClick={dialogState.show}>
                <LuSearch />
            </Button>

            <SearchDialog
                state={dialogState} />
        </>
    );
}