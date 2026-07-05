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
            name: "description",
            label: "Kurzbeschreibung (f\xFCr Katalog)",
            required: true,
            ui: {
              component: "textarea"
            }
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
      },
      {
        name: "pages",
        label: "Seiten",
        path: "src/content/pages",
        format: "json",
        fields: [
          {
            type: "object",
            name: "hero",
            label: "Hero Bereich",
            fields: [
              { type: "string", name: "badge", label: "Badge-Text" },
              { type: "string", name: "title", label: "Titel (HTML erlaubt)", ui: { component: "textarea" } },
              { type: "string", name: "lede", label: "Unterzeile/Beschreibung", ui: { component: "textarea" } },
              { type: "string", name: "primaryCtaText", label: "Prim\xE4rer Button Text" },
              { type: "string", name: "primaryCtaLink", label: "Prim\xE4rer Button Link" },
              { type: "string", name: "secondaryCtaText", label: "Sekund\xE4rer Button Text" },
              { type: "string", name: "secondaryCtaLink", label: "Sekund\xE4rer Button Link" },
              { type: "string", name: "trustIndicator", label: "Trust-Leiste Text" }
            ]
          },
          {
            type: "object",
            name: "bridge",
            label: "Br\xFCcken-Karte",
            fields: [
              { type: "string", name: "row", label: "Zeile 1 (Titel)" },
              { type: "string", name: "label", label: "Zeile 2 (Beschreibung)" }
            ]
          },
          {
            type: "object",
            name: "about",
            label: "\xDCber Mich Vorschau",
            fields: [
              { type: "string", name: "badge", label: "Badge-Text" },
              { type: "string", name: "title", label: "Haupt\xFCberschrift" },
              { type: "string", name: "text1", label: "Absatz 1", ui: { component: "textarea" } },
              { type: "string", name: "text2", label: "Absatz 2", ui: { component: "textarea" } },
              { type: "string", name: "ctaText", label: "Link Text" },
              { type: "string", name: "ctaLink", label: "Link Ziel" },
              { type: "string", name: "portraitBadge", label: "Portrait-Badge Text" }
            ]
          },
          {
            type: "object",
            name: "projectsHeader",
            label: "Bereichs-Header: Projekte",
            fields: [
              { type: "string", name: "eyebrow", label: "Augenbraue (Eyebrow)" },
              { type: "string", name: "title", label: "Titel" },
              { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
            ]
          },
          {
            type: "object",
            name: "qualificationsHeader",
            label: "Bereichs-Header: Qualifikationen",
            fields: [
              { type: "string", name: "eyebrow", label: "Augenbraue (Eyebrow)" },
              { type: "string", name: "title", label: "Titel" },
              { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
            ]
          },
          {
            type: "object",
            name: "principlesHeader",
            label: "Bereichs-Header: Arbeitsweise",
            fields: [
              { type: "string", name: "eyebrow", label: "Augenbraue (Eyebrow)" },
              { type: "string", name: "title", label: "Titel" },
              { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
            ]
          },
          {
            type: "object",
            name: "skillsHeader",
            label: "Bereichs-Header: F\xE4higkeiten",
            fields: [
              { type: "string", name: "eyebrow", label: "Augenbraue (Eyebrow)" },
              { type: "string", name: "title", label: "Titel" },
              { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
