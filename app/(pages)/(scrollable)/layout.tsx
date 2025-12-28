import Header from "@/app/components/layout/Header";

export default function Layout(props: {
    children?: React.ReactNode,
}) {
    return (
        <>
            <Header
                className="fixed top-0 left-0 right-0 scrollable-header" />
            <main
                className="flex-1 w-full max-w-4xl px-4 pt-16 pb-8 mx-auto min-h-dvh flex flex-col">
                {props.children}
            </main>
        </>
    );
}