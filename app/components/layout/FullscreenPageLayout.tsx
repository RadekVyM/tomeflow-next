import PageHeader from "./PageHeader";

export default function FullscreenPageLayout(props: {
    breadcrumbs: React.ReactNode,
    pageHeading: React.ReactNode,
    actionButtons?: React.ReactNode,
    smActionButtons?: React.ReactNode,
    children?: React.ReactNode,
}) {
    return (
        <div className="fullscreen sm:col-start-2 h-dvh min-h-dvh max-h-dvh overflow-hidden flex flex-col">
            <PageHeader
                fullscreen
                breadcrumbs={props.breadcrumbs}
                pageHeading={props.pageHeading}
                actionButtons={props.actionButtons}
                smActionButtons={props.smActionButtons} />

            <main className="flex-1 overflow-hidden flex flex-col">
                {props.children}
            </main>
        </div>
    );
}