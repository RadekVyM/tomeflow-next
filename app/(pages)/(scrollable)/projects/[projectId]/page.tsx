import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import { getProject } from "@/app/services/projects";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page(props: {
    params: Promise<{ projectId: string }>
}) {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    }

    const project = await getProject(session.user.id, params.projectId);

    return (
        <>
            <header
                className="mb-8">
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                        { href: "/projects", title: "Projects" },
                        { href: `/projects/${params.projectId}`, title: project?.title || "Loading..." },
                    ]} />
                <div
                    className="flex justify-between items-start">
                    <PageHeading>
                        {project?.title}
                    </PageHeading>
                    <div
                        className="flex gap-2">
                    </div>
                </div>
            </header>
        </>
    );
}