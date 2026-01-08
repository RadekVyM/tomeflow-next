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
        <div className="sm:col-start-2">
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