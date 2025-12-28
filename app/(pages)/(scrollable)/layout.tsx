import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";

export default function Layout(props: {
    children?: React.ReactNode,
}) {
    return (
        <ScrollablePageLayout>
            {props.children}
        </ScrollablePageLayout>
    );
}