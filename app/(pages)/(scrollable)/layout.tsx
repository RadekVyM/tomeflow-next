export default function Layout(props: {
    children?: React.ReactNode,
}) {
    return (
        <main
            className={"flex-1"}>
            {props.children}
        </main>
    );
}