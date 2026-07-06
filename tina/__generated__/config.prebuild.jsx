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
            name: "subtitle",
            label: "Untertitel"
          },
          {
            type: "object",
            name: "sidebar",
            label: "Projekt-Sidebar",
            fields: [
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
                name: "timeline",
                label: "Zeitraum"
              },
              {
                type: "string",
                name: "role",
                label: "Meine Rolle"
              },
              {
                type: "string",
                name: "technologies",
                label: "Technologien (Kommagetrennt)",
                required: true
              },
              {
                type: "string",
                name: "devStack",
                label: "Development Stack Liste",
                list: true
              },
              {
                type: "string",
                name: "aiBuilders",
                label: "AI Builders Liste",
                list: true
              },
              {
                type: "string",
                name: "notice",
                label: "Sonderhinweis (z.B. Beta-Notice)",
                ui: {
                  component: "textarea"
                }
              }
            ]
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
        templates: [
          {
            name: "home",
            label: "Startseite",
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
          },
          {
            name: "about",
            label: "\xDCber Mich Seite",
            fields: [
              {
                type: "object",
                name: "hero",
                label: "Hero Bereich",
                fields: [
                  { type: "string", name: "eyebrow", label: "Augenbraue" },
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "lede", label: "Unterzeile/Beschreibung", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "philosophy",
                label: "Philosophie",
                fields: [
                  { type: "string", name: "eyebrow", label: "Augenbraue" },
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "text1", label: "Absatz 1", ui: { component: "textarea" } },
                  { type: "string", name: "text2", label: "Absatz 2", ui: { component: "textarea" } },
                  { type: "string", name: "text3", label: "Absatz 3", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "howIWork",
                label: "Arbeitsweise",
                fields: [
                  { type: "string", name: "eyebrow", label: "Augenbraue" },
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "qualificationsHeader",
                label: "Bereichs-Header: Qualifikationen",
                fields: [
                  { type: "string", name: "eyebrow", label: "Augenbraue" },
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "ctaBand",
                label: "CTA Band",
                fields: [
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } }
                ]
              }
            ]
          },
          {
            name: "contact",
            label: "Kontakt Seite",
            fields: [
              {
                type: "object",
                name: "hero",
                label: "Hero Bereich",
                fields: [
                  { type: "string", name: "eyebrow", label: "Augenbraue" },
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "lede", label: "Unterzeile/Beschreibung", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "touch",
                label: "Get in Touch Bereich",
                fields: [
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "description", label: "Beschreibungstext", ui: { component: "textarea" } },
                  { type: "string", name: "email", label: "E-Mail Adresse" }
                ]
              },
              {
                type: "object",
                name: "info",
                label: "Sidebar Kontaktinfos",
                fields: [
                  { type: "string", name: "cvSubject", label: "Betreffzeile f\xFCr Lebenslauf-Knopf" },
                  { type: "string", name: "email", label: "Angezeigte E-Mail" },
                  { type: "string", name: "location", label: "Standort" },
                  { type: "string", name: "responseTime", label: "Antwortzeit" },
                  { type: "string", name: "openFor", label: "Offen f\xFCr (Beschreibungstext)", ui: { component: "textarea" } }
                ]
              }
            ]
          },
          {
            name: "footer",
            label: "Footer Layout",
            fields: [
              {
                type: "object",
                name: "topTier",
                label: "Obere Info-Karten",
                fields: [
                  { type: "string", name: "availability", label: "Verf\xFCgbarkeit" },
                  { type: "string", name: "email", label: "E-Mail" },
                  { type: "string", name: "location", label: "Standort" }
                ]
              },
              {
                type: "object",
                name: "brand",
                label: "Branding",
                fields: [
                  { type: "string", name: "description", label: "Marken-Beschreibung", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "newsletter",
                label: "Newsletter",
                fields: [
                  { type: "string", name: "title", label: "Titel" },
                  { type: "string", name: "text", label: "Newsletter Text" },
                  { type: "string", name: "placeholder", label: "E-Mail Platzhalter" }
                ]
              },
              {
                type: "object",
                name: "bottom",
                label: "Copyright Leiste",
                fields: [
                  { type: "string", name: "copyright", label: "Copyright Inhaber" },
                  { type: "string", name: "email", label: "Kontakt E-Mail" }
                ]
              }
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
