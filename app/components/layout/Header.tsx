import { cn } from "../../utils/tailwind";
import SearchButton from "../SearchButton";
import UserButton from "./UserButton";

export default async function Header(props: {
    className?: string,
    leading?: React.ReactNode,
    children?: React.ReactNode,
    withFallbackUserButton?: boolean,
}) {
    return (
        <header
            className={cn("px-4 py-2 grid grid-cols-[calc(100%-var(--spacing)*25)_auto] pointer-events-none z-10", props.className)}>
            <div
                className={cn(!!props.leading && "pointer-events-auto")}>
                {props.leading}
            </div>
            <div
                className="justify-self-end flex gap-4 items-center">
                <SearchButton
                    className="pointer-events-auto" />
                <UserButton
                    className="pointer-events-auto"
                    withFallback={props.withFallbackUserButton} />
            </div>

            {props.children &&
                <div
                    className="row-start-2 col-start-1 col-end-3 pointer-events-auto">
                    {props.children}
                </div>}
        </header>
    );
}