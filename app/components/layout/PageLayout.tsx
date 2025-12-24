export default function PageLayout(props: {
    breadcrumbs: React.ReactNode,
    pageHeading: React.ReactNode,
    actionButtons?: React.ReactNode,
    children?: React.ReactNode,
}) {
    return (
        <>
            <header
                className="mb-8">
                {props.breadcrumbs}
                <div
                    className="flex justify-between items-start">
                    {props.pageHeading}
                    <div
                        className="flex gap-2">
                        {props.actionButtons}
                    </div>
                </div>
            </header>

            {props.children}
        </>
    );
}