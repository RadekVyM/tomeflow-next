export default function Layout(props: {
    children?: React.ReactNode,
}) {
    return (
        <main
            className={"flex-1 w-full max-w-4xl px-4 pt-16 mx-auto min-h-dvh flex flex-col"}>
            {props.children}
        </main>
    );
}