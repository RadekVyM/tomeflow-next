import NewProjectButton from "@/app/components/project/NewProjectButton";
import { LuLayoutGrid } from "react-icons/lu";

export default function EmptyProjects() {
    return (
        <section
            className="flex-1 mb-16 mx-auto flex flex-col items-center justify-center">
            <LuLayoutGrid
                className="w-12 h-12 text-on-surface-muted mb-4" />

            <div className="w-fit text-on-surface text-lg font-semibold text-center">Oops! There's no project yet...</div>
            <div className="w-fit text-on-surface-muted text-sm text-center mb-5">Please create a new project to get started.</div>

            <NewProjectButton
                nondynamic />
        </section>
    );
}