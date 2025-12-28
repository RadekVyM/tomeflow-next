import { cn } from "../../utils/tailwind";
import UserButton from "./UserButton";

export default async function Header(props: {
    className?: string,
    leading?: React.ReactNode,
    children?: React.ReactNode,
    withFallbackUserButton?: boolean,
}) {
    return (
        <header
            className={cn("px-4 py-2 grid grid-cols-[calc(100%-var(--spacing)*12)_auto] pointer-events-none z-10", props.className)}>
            <div
                className="pointer-events-auto">
                {props.leading}
            </div>
            <UserButton
                withFallback={props.withFallbackUserButton} />
            
            {props.children &&
                <div
                    className="row-start-2 col-start-1 col-end-3 pointer-events-auto">
                    {props.children}
                </div>}
        </header>
    );
}