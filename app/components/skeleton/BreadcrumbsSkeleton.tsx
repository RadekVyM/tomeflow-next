import Breadcrumbs from "../Breadcrumbs";

export default function BreadcrumbsSkeleton(props: {
    className?: string,
    loadedItemsCount: number,
}) {
    return (
        <Breadcrumbs
            className={props.className}
            locations={[
                { href: "/", title: "Home" },
                { href: "/projects", title: "Projects" },
                ...(new Array(props.loadedItemsCount).fill(null)),
            ]} />
    );
}