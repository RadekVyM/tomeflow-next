import PageHeader from "./PageHeader";
import ScrollableMain from "./ScrollableMain";

export default function ScrollablePageLayout(props: {
    breadcrumbs?: React.ReactNode,
    pageHeading?: React.ReactNode,
    actionButtons?: React.ReactNode,
    smActionButtons?: React.ReactNode,
    children?: React.ReactNode,
}) {
    return (
        <div className="sm:col-start-2 min-h-dvh max-w-[calc(100dvw-var(--spacing)*4)] sm:max-w-[calc(100dvw-var(--spacing)*19)] flex flex-col">
            <PageHeader
                breadcrumbs={props.breadcrumbs}
                pageHeading={props.pageHeading}
                actionButtons={props.actionButtons}
                smActionButtons={props.smActionButtons} />

            <ScrollableMain>
                {props.children}
            </ScrollableMain>
        </div>
    );
}