import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SimplyPDF",
    short_name: "SimplyPDF",
    description:
      "The Easiest PDF Tool for merging, splitting, compressing, and converting PDFs.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon-new.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
