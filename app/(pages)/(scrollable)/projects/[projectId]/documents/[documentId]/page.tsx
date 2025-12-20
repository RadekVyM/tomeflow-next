import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import { getDocument } from "@/app/services/documents";
import { getProject } from "@/app/services/projects";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MoreButton from "./components/MoreButton";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import DocumentContent from "./components/DocumentContent";

export default async function Page(props: {
    params: Promise<{ projectId: string, documentId: string }>
}) {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    }

    const project = await getProject(session.user.id, params.projectId);
    const document = await getDocument(session.user.id, params.documentId);

    const isPending = !project || !document;

    return (
        <>
            <header
                className="mb-8">
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                        { href: "/projects", title: "Projects" },
                        { href: `/projects/${params.projectId}`, title: project?.title || "Loading..." },
                        { href: `/projects/${params.projectId}/documents/${params.documentId}`, title: document?.title || "Loading..." },
                    ]} />
                <div
                    className="flex justify-between items-start">
                    <PageHeading>
                        {document?.title}
                    </PageHeading>
                    <MoreButton
                        disabled={isPending}
                        documentId={params.documentId}
                        documentTitle={document?.title || ""} />
                </div>
            </header>

            {(isPending || !document) ?
                <LoadingSpinner /> :
                <DocumentContent
                    content={document.content}
                    projectId={params.projectId}
                    documentId={params.documentId} />}
        </>
    );
}