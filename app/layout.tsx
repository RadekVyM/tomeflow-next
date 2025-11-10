import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "@/app/css/animations.css";
import "@/app/css/button.css";
import "@/app/css/colors.css";
import "@/app/css/markdown.css";
import "@/app/css/globals.css";
import { ConfirmDialogs } from "./components/confirm";
import Header from "./components/layout/Header";

const geistSans = Gabarito({
    variable: "--font-gabarito-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Tomeflow",
    description: "An all-in-one app for note-taking, project management, and task organization, designed to help users streamline their workflow and boost productivity.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en">
            <body className={`${geistSans.variable} antialiased font-sans`}>
                <div
                    className="flex flex-col min-h-dvh">
                    <Header
                        className="fixed top-0 left-0 right-0 bg-surface md:bg-transparent" />
                    {children}
                </div>
                <ConfirmDialogs />
            </body>
        </html>
    );
}