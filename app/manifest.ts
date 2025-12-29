import { MetadataRoute } from "next";
 
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Tomeflow",
        short_name: "Tomeflow",
        description: "An all-in-one app for note-taking, project management, and task organization, designed to help users streamline their workflow and boost productivity.",
        start_url: "/",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#f8fafc",
        icons: [
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
        ]
    };
}