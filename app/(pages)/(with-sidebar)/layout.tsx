import Button from "@/app/components/input/Button";
import UserButton from "@/app/components/layout/UserButton";
import SearchButton from "@/app/components/SearchButton";
import { cn } from "@/app/utils/tailwind";
import { TbHome, TbLayoutGrid, TbSettings } from "react-icons/tb";
import { LuHouse } from "react-icons/lu";

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
        <aside
            className={cn(
                "fixed top-0 flex items-center z-50",
                "flex-row-reverse right-0 gap-3 h-14 mr-3",
                "sm:border-r sm:border-outline-variant sm:w-15 sm:left-0 sm:right-auto sm:h-full sm:bg-surface sm:flex-col sm:gap-0 sm:mr-0 sm:pt-1.5")}>
            <UserButton
                className="sm:mb-2" />

            <div className="w-10 h-px bg-outline-variant mb-3 hidden sm:block"></div>

            <SearchButton />

            <nav
                className="flex-1 hidden mt-2 mb-3 sm:flex flex-col gap-4 justify-between">
                <div
                    className="flex flex-col gap-2">
                    <Button
                        variant="icon-default"
                        size="lg"
                        href="/"
                        title="Home">
                        <LuHouse
                            className="text-lg" />
                    </Button>
                    <Button
                        variant="icon-default"
                        size="lg"
                        href="/projects"
                        title="Projects">
                        <TbLayoutGrid
                            className="text-lg" />
                    </Button>
                </div>

                <Button
                    variant="icon-default"
                    size="lg">
                    <TbSettings
                        className="text-lg" />
                </Button>
            </nav>
        </aside>
    );
}