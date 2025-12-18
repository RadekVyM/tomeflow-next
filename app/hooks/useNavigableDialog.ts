"use client"

import { useRouter } from "next/navigation";
import { DialogState } from "../types/DialogState";
import useDialog from "./useDialog";

export default function useNavigableDialog(
    openAnimation?: string,
    hideAnimation?: string
): DialogState {
    const router = useRouter();
    const state = useDialog(openAnimation, hideAnimation);

    function onClose() {
        router.back();
    }

    return {
        ...state,
        onClose,
    };
}