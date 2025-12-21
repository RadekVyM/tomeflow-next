export default function Layout(props: {
    children?: React.ReactNode,
}) {
    return (
        <main
            className={"flex-1 overflow-hidden"}>
            {props.children}
        </main>
    );
}