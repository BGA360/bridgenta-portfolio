// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  // Get this from tina.io for production
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  // See https://tina.io/docs/schema/ for more information
  schema: {
    collections: [
      {
        name: "project",
        label: "Projekte",
        path: "src/content/projects",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titel",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Kategorie",
            required: true
          },
          {
            type: "string",
            name: "status",
            label: "Status",
            options: ["In Entwicklung", "Private Beta", "Konzept / Aufbau"],
            required: true
          },
          {
            type: "string",
            name: "technologies",
            label: "Technologien",
            required: true
          },
          {
            type: "string",
            name: "notice",
            label: "Sonderhinweis (z.B. Beta-Notice)",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "rich-text",
            name: "body",
            label: "Inhalt (Haupttext)",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
