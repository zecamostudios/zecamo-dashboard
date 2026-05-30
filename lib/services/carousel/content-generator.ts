import OpenAI from "openai";
import type { ContentPost } from "@/lib/types";

export interface CarouselSlide {
  type: "hook" | "body" | "cta";
  title?: string;
  text: string;
}

export interface CarouselPlan {
  slides: CarouselSlide[];
  caption: string;
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCarouselPlan(post: ContentPost): Promise<CarouselPlan> {
  const source = [post.hook, post.contenido, post.cta].filter(Boolean).join("\n\n");

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Sos un diseñador de contenido para redes sociales.
Tu tarea es tomar un post y convertirlo en un carrusel de Instagram de 4 a 6 slides.
Devolvé un JSON con este esquema exacto:
{
  "slides": [
    { "type": "hook", "text": "frase de gancho impactante" },
    { "type": "body", "title": "Punto 1", "text": "explicación en 1-2 oraciones cortas" },
    { "type": "body", "title": "Punto 2", "text": "explicación en 1-2 oraciones cortas" },
    ... más slides body si corresponde ...
    { "type": "cta", "text": "llamada a la acción clara" }
  ],
  "caption": "caption completo para Instagram con emojis y hashtags"
}
Reglas:
- El hook debe ser una pregunta o afirmación impactante de máximo 10 palabras
- Cada body slide debe tener un title corto (2-4 palabras) y texto de máximo 25 palabras
- El CTA debe ser directo y motivador (ej: "Guardalo para cuando lo necesites", "Comentá tu duda")
- Máximo 6 slides en total (1 hook + N body + 1 cta)
- El caption usa el idioma del contenido original`,
      },
      {
        role: "user",
        content: `Contenido del post:\n${source}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as CarouselPlan;
}
