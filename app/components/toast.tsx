"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/tailwind";
import { LuCircleAlert, LuX } from "react-icons/lu";
import { useEventListener } from "../hooks/useEventListener";
import Loop from "../services/client/Loop";
import Button from "./input/Button";
import useIsClient from "../hooks/useIsClient";
import { IconType } from "react-icons";

const TOP_LAYER_CHANGED_EVENT_KEY = "top-layer-changed";
const NEW_TOAST_EVENT_KEY = "new-toast";
const UPDATE_PERMANENT_TOAST_EVENT_KEY = "update-permanent-toast";

const ANIMATION_LENGTH = 200;
const TOAST_AUTOCLOSE_DELAY = 8000 + ANIMATION_LENGTH;

type ToastType = "default" | "permanent"

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface WindowEventMap {
        "top-layer-changed": TopLayerChangedEvent,
        "new-toast": ToastEvent,
        "update-permanent-toast": UpdatePermanentToastEvent,
    }
}

class TopLayerChangedEvent extends CustomEvent<unknown> {
    constructor() {
        super(TOP_LAYER_CHANGED_EVENT_KEY);
    }
}

class ToastEvent extends CustomEvent<unknown> {
    id: string;
    title: string;
    type: ToastType;
    icon: IconType;

    constructor(
        id: string,
        title: string,
        type: ToastType,
        icon: IconType,
    ) {
        super(NEW_TOAST_EVENT_KEY);

        this.id = id;
        this.title = title;
        this.type = type;
        this.icon = icon;
    }
}

class UpdatePermanentToastEvent extends CustomEvent<unknown> {
    id: string;
    title: string;
    type: ToastType;
    icon: IconType;

    constructor(
        id: string,
        title: string,
        type: ToastType,
        icon: IconType,
    ) {
        super(UPDATE_PERMANENT_TOAST_EVENT_KEY);

        this.id = id;
        this.title = title;
        this.type = type;
        this.icon = icon;
    }
}

type ToastState = {
    id: string,
    title: string,
    startTime: number,
    type: ToastType,
    icon: IconType,
}

export default function toast(
    title: string,
    type: ToastType = "default",
    icon: IconType = LuCircleAlert,
) {
    const id = crypto.randomUUID();

    window.dispatchEvent(new ToastEvent(
        id,
        title,
        type,
        icon));

    if (type === "permanent") {
        return (
            title: string,
            icon: IconType = LuCircleAlert
        ) => window.dispatchEvent(new UpdatePermanentToastEvent(
            id,
            title,
            "default",
            icon));
    }

    return undefined;
}

export function dispatchTopLayerChanged() {
    window.dispatchEvent(new TopLayerChangedEvent());
}

export function Toasts() {
    const isClient = useIsClient();

    if (!isClient) {
        return undefined;
    }

    return (
        <ToastsInternal />
    );
}

function ToastsInternal() {
    const containerRef = useRef<HTMLUListElement>(null);
    const [toasts, setToasts] = useState<Array<ToastState>>([]);
    const [portal, setPortal] = useState<Element>(document.body);

    useEffect(() => {
        const onTopLayerChanged = () => {
            const dialogs = document.querySelectorAll("dialog");
            const portal = dialogs.length === 0 ?
                (document.fullscreenElement || document.body) :
                dialogs[dialogs.length - 1];

            setPortal(portal);

            containerRef.current?.hidePopover();
            setTimeout(() => containerRef.current?.showPopover(), 10);
        };

        onTopLayerChanged();

        window.addEventListener(TOP_LAYER_CHANGED_EVENT_KEY, onTopLayerChanged);

        return () => window.removeEventListener(TOP_LAYER_CHANGED_EVENT_KEY, onTopLayerChanged);
    }, []);

    useEventListener(NEW_TOAST_EVENT_KEY, (e) => {
        const newToast: ToastState = {
            id: e.id,
            type: e.type,
            title: e.title,
            icon: e.icon,
            startTime: new Date().getTime(),
        };

        setToasts((old) => [...old, newToast]);
    });

    useEventListener(UPDATE_PERMANENT_TOAST_EVENT_KEY, (e) => {
        setToasts((old) => {
            const toastIndex = old.findIndex((t) => t.id === e.id);

            if (toastIndex < 0) {
                return old;
            }

            const newToasts = [...old];

            newToasts[toastIndex] = {
                ...newToasts[toastIndex],
                type: e.type,
                title: e.title,
                icon: e.icon,
                startTime: new Date().getTime(),
            };

            return newToasts;
        });
    });

    return createPortal(
        <ul
            ref={containerRef}
            popover="manual"
            className="fixed inset-auto right-0 bottom-0 backdrop:hidden bg-transparent pointer-events-none p-6 w-[min(100%,calc(var(--spacing,0.25rem)*90))] flex flex-col gap-2 overflow-hidden">
            {toasts.map((t) =>
                <Toast
                    key={t.id}
                    toast={t}
                    onClose={() => setToasts((old) => old.filter((ot) => ot.id !== t.id))}
                    updateStartTime={(id, newStartTime) => setToasts((old) => {
                        const index = old.findIndex((t) => t.id === id)!;
                        const toast = old[index];
                        const newToasts = [...old];

                        newToasts[index] = {
                            ...toast,
                            startTime: newStartTime,
                        };

                        return newToasts;
                    })} />)}
        </ul>, portal);
}

function Toast(props: {
    className?: string,
    toast: ToastState,
    onClose?: () => void,
    updateStartTime: (id: string, newStartTime: number) => void,
}) {
    const loopRef = useRef<Loop | null>(null);
    const onCloseRef = useRef<() => void>(props.onClose);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [animation, setAnimation] = useState<string>(new Date().getTime() - props.toast.startTime <= ANIMATION_LENGTH ? "animate-slideLeftIn" : "");
    const isPermanent = props.toast.type === "permanent";
    const Icon = props.toast.icon;

    useEffect(() => {
        new Promise((resolve) => setTimeout(resolve, ANIMATION_LENGTH))
            .then(() => setAnimation(""));
    }, []);

    useEffect(() => {
        if (isPermanent) {
            return;
        }

        loopRef.current?.stop();
        loopRef.current?.dispose();
        loopRef.current = new Loop(() => {
            const newTime = new Date().getTime();
            setCurrentTime(newTime);

            if (newTime - props.toast.startTime >= TOAST_AUTOCLOSE_DELAY) {
                onCloseRef.current?.();

                loopRef.current?.stop();
                loopRef.current?.dispose();
                loopRef.current = null;
            }
        });
        loopRef.current.start();

        return () => {
            loopRef.current?.stop();
            loopRef.current?.dispose();
            loopRef.current = null;
        };
    }, [props.toast.startTime, isPermanent]);

    async function onClose() {
        setAnimation("animate-slideRightOut");

        await new Promise((resolve) => setTimeout(resolve, ANIMATION_LENGTH));

        props.onClose?.();
    }

    onCloseRef.current = onClose;

    const timeDiff = currentTime - props.toast.startTime;
    const progress = timeDiff / TOAST_AUTOCLOSE_DELAY;

    return (
        <li
            className={cn(
                "bg-surface-container border-0 text-on-surface-container rounded-xl pointer-events-auto drop-shadow-lg drop-shadow-shade pl-3 pr-2 py-2 w-full min-h-12 grid grid-cols-[auto_1fr_auto] gap-2.5 items-center relative overflow-clip",
                animation,
                props.className)}
            onPointerEnter={() => loopRef.current?.stop()}
            onPointerLeave={() => {
                props.updateStartTime(props.toast.id, props.toast.startTime + new Date().getTime() - currentTime);
                setCurrentTime(new Date().getTime());
                setTimeout(() => loopRef.current?.start(), 10);
            }}>
            <Icon
                className="text-primary w-5 h-5" />
            <h2
                className="font-semibold text-sm">
                {props.toast.title}
            </h2>

            {!isPermanent && props.onClose &&
                <Button
                    className="pointer-events-auto animate-fadeIn"
                    variant="icon-default"
                    size="sm"
                    onClick={onClose}>
                    <LuX />
                </Button>}

            <div
                className={cn("absolute left-0 bottom-0 h-0.5 bg-primary rounded-full", isPermanent && "invisible", !isPermanent && "animate-fadeIn")}
                style={{
                    right: `${progress * 100}%`
                }}>
            </div>
        </li>
    );
}