import type { Metadata, Viewport } from "next";
import { Gabarito, Google_Sans_Code, Roboto } from "next/font/google";
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
import { cn } from "./utils/tailwind";
import { cookies } from "next/headers";

const gabarito = Gabarito({
    variable: "--font-gabarito-sans",
    subsets: ["latin"],
});

const robotoItalic = Roboto({
    variable: "--font-roboto-italic",
    subsets: ["latin"],
    style: ["italic"],
});

const googleSansCode = Google_Sans_Code({
    variable: "--font-google-sans-code",
    subsets: ["latin"],
    style: ["normal", "italic"],
    fallback: ["Consolas", "Bitstream Vera Sans Mono", "Courier New", "Courier", "monospace"],
});

export const metadata: Metadata = {
    title: "Tomeflow",
    description: "An all-in-one app for note-taking, project management, and task organization, designed to help users streamline their workflow and boost productivity.",
    openGraph: {
        title: "Tomeflow",
        description: "Streamline your workflow and boost productivity.",
        url: "https://tomeflow.com",
        siteName: "Tomeflow",
        locale: "en_US",
        type: "website",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#161921" },
        { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    ],
    width: "device-width",
    initialScale: 1,
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const theme = cookieStore.get("theme")?.value || "system";

    return (
        <html
            lang="en"
            className={cn(gabarito.variable, googleSansCode.variable, robotoItalic.variable)}
            data-theme={theme}>
            <QueryClientProvider>
                <body className="antialiased font-sans">
                    {children}

                    <Analytics />
                    <SpeedInsights />
                    <ConfirmDialogs />
                    <Toasts />
                </body>
            </QueryClientProvider>
        </html>
    );
}