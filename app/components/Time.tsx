"use client"

import { useEffect, useRef, useState } from "react";
import useIsClient from "../hooks/useIsClient";

export default function Time(props: {
    className?: string,
}) {
    const time = useTime();
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <TimeInternal
                className={props.className}
                time={new Date(0)} />
        );
    }

    return (
        <TimeInternal
            className={props.className}
            time={time} />
    );
}

function TimeInternal(props: {
    className?: string,
    time: Date,
}) {
    return (
        <div
            className={props.className}>
            <div
                className="font-bold text-6xl">
                <span>
                    {props.time.getHours().toLocaleString(undefined, { minimumIntegerDigits: 2 })}
                </span>:
                <span>
                    {props.time.getMinutes().toLocaleString(undefined, { minimumIntegerDigits: 2 })}
                </span>
                <span
                    className="text-4xl">
                    :{props.time.getSeconds().toLocaleString(undefined, { minimumIntegerDigits: 2 })}
                </span>
            </div>
            <div
                className="font-semibold text-xl text-on-surface-muted">
                {props.time.toLocaleDateString("cs-cz")}
            </div>
        </div>
    );
}

function useTime() {
    const [time, setTime] = useState<Date>(new Date());
    const loop = useRef<Loop | null>(null);

    useEffect(() => {
        loop.current = new Loop(() => setTime(new Date()));
        loop.current.start();

        return () => loop.current?.reset();
    }, []);

    return time;
}

class Loop {
    #isRunning: boolean = false;
    #action: () => void;

    constructor(action: () => void) {
        this.#action = action;
    }

    start() {
        this.#isRunning = true;
        requestAnimationFrame(() => this.#loop());
    }

    reset() {
        this.#isRunning = false;
    }

    #loop() {
        this.#action();

        if (this.#isRunning) {
            requestAnimationFrame(() => this.#loop());
        }
    }
}