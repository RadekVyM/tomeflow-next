"use client";

import DefaultButton from "@/app/components/input/DefaultButton";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { useContext } from "react";
import { TbPencil } from "react-icons/tb";
import { DocumentPageContext } from "./DocumentPageContextProvider";

export default function EditButton(props: {
    className?: string,
    disabled?: boolean,
    nondynamic?: boolean,
}) {
    const { dialogState } = useContext(DocumentPageContext);
    const isLarge = useMediaQuery("(width >= 40rem)");

    return (
        <DefaultButton
            variant={props.nondynamic ? "primary" : "dynamic-primary"}
            title={isLarge ? undefined : "Edit document"}
            className={props.className}
            onClick={dialogState?.show}
            disabled={props.disabled}
            icon={TbPencil}>
            Edit document
        </DefaultButton>
    );
}