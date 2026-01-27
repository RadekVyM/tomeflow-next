"use client";

import { DialogState } from "@/app/types/DialogState";
import { User } from "next-auth";
import ContentDialog from "../../ContentDialog";
import SignOutButton from "./SignOutButton";
import Button from "../../input/Button";
import { LuHouse } from "react-icons/lu";
import { TbLayoutGrid } from "react-icons/tb";
import ThemeSwitcher from "../ThemeSwitcher";

export default function MobileMenuDialog(props: {
    state: DialogState,
    user: User,
}) {
    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            heading={
                <>
                    <div>{props.user.name}</div>
                    <small className="block text-sm text-on-surface-container-muted font-normal">{props.user.email}</small>
                </>}
            className="max-w-md">
            <SignOutButton
                className="mb-6" />

            <h3
                className="text-sm text-on-surface-container-muted font-semibold mb-1">
                Explore
            </h3>
            <ul
                className="flex flex-col divide-y divide-outline-variant mb-4">
                <li
                    className="py-0.5">
                    <Button
                        href="/"
                        size="lg"
                        className="w-full"
                        onClick={props.state.hide}>
                        <LuHouse className="text-lg text-primary" />
                        <span>Home</span>
                    </Button>
                </li>
                <li
                    className="py-0.5">
                    <Button
                        href="/projects"
                        size="lg"
                        className="w-full"
                        onClick={props.state.hide}>
                        <TbLayoutGrid className="text-lg text-primary" />
                        <span>Projects</span>
                    </Button>
                </li>
            </ul>

            <h3
                className="text-sm text-on-surface-container-muted font-semibold mb-2">
                Theme
            </h3>
            <ThemeSwitcher />
        </ContentDialog>
    );
}