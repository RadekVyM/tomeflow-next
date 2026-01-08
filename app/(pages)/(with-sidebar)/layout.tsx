import UserButton from "@/app/components/layout/UserButton";
import SearchButton from "@/app/components/SearchButton";
import { cn } from "@/app/utils/tailwind";

export default function Layout(props: {
    children?: React.ReactNode,
}) {
    return (
        <div
            className="grid sm:grid-cols-[calc(15*var(--spacing))_1fr]">
            <SideBar />

            {props.children}
        </div>
    );
}

function SideBar() {
    return (
        <div
            className={cn(
                "fixed top-0 flex items-center z-50",
                "flex-row-reverse right-0 gap-3 h-14 mr-3",
                "sm:border-r sm:border-outline-variant sm:w-15 sm:left-0 sm:right-auto sm:h-full sm:bg-surface sm:flex-col sm:gap-0 sm:mr-0 sm:pt-1.5")}>
            <UserButton
                className="sm:mb-2" />
            
            <SearchButton />
        </div>
    );
}