"use client";

import { useEffect, useRef, useState } from "react";
import useIsClient from "../hooks/useIsClient";
import TimeSkeleton from "./skeleton/TimeSkeleton";
import Loop from "../services/client/Loop";

export default function Time(props: {
    className?: string,
}) {
    const time = useTime();
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <TimeSkeleton
                className={props.className} />
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
    const loopRef = useRef<Loop | null>(null);

    useEffect(() => {
        loopRef.current = new Loop(() => setTime(new Date()));
        loopRef.current.start();

        return () => {
            loopRef.current?.stop();
            loopRef.current?.dispose();
            loopRef.current = null;
        };
    }, []);

    return time;
}