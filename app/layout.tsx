import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "@/app/css/animations.css";
import "@/app/css/button.css";
import "@/app/css/colors.css";
import "@/app/css/markdown.css";
import "@/app/css/globals.css";
import { ConfirmDialogs } from "./components/confirm";
import QueryClientProvider from "./components/react-query/QueryClientProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toasts } from "./components/toast";

const gabarito = Gabarito({
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
            lang="en" className={gabarito.variable}>
            <QueryClientProvider>
                <body className="antialiased font-sans">
                    <div
                        className="flex flex-col min-h-dvh">
                        {children}
                    </div>
                    <Analytics />
                    <SpeedInsights />
                    <ConfirmDialogs />
                    <Toasts />
                </body>
            </QueryClientProvider>
        </html>
    );
}