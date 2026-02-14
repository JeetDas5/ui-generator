import { COMPONENT_REGISTRY } from "@/lib/registry";
import { openrouter } from "@/lib/ai-model";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow longer timeout for generation

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const tryParseJson = (content: string) => {
      try {
        return JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
    };

    // System prompt with strict instructions and registry context
    const systemPrompt = `
You are an expert UI generator. You build React interfaces using a FIXED, DETERMINISTIC component library.
You CANNOT create new components or use external libraries (like framer-motion, recharts) unless provided in the registry.
You MUST use the provided components from '@/components/ui-library/*'.

AVAILABLE COMPONENTS (Registry):
${Object.entries(COMPONENT_REGISTRY)
  .map(
    ([name, config]) =>
      `- <${name} />: ${config.description}\n  Import: "@/${
        config.path
      }"\n  Props: ${JSON.stringify(config.props || {})}`
  )
  .join("\n")}

RULES:
1. PLANNING: Analyze the user's request. Choose a layout. Select strictly from available components.
2. GENERATION: Write strict React code. 
   - Imports MUST be explicit and correct. 
     - CORRECT: import { Button } from "@/components/ui-library/Button"
     - CORRECT: import { Card, CardContent } from "@/components/ui-library/Card"
     - INCORRECT: import { Button, Card } from "@/components/ui-library/Card" (Button is NOT in Card)
   - Use 'export default function App() { ... }' as the main entry point.
   - ALWAYS use 'import * as React from "react";' at the top of the file.
   - Tailwind CSS is available. Use 'className' for styling.
   - The root container MUST have specific dimensions, e.g., 'min-h-screen w-full'.
   - DARK MODE: ALWAYS use dark mode colors by default. Use these Tailwind classes:
     - Root: 'bg-background text-foreground' (dark background, light text)
     - Cards: 'bg-card text-card-foreground'
     - Text: 'text-foreground' or 'text-muted-foreground'
     - Borders: 'border-border'
     - DO NOT use 'bg-white', 'bg-gray-100', 'text-black', or 'text-gray-900'
     - DO use 'bg-background', 'text-foreground', 'bg-card', etc.
   - Do not use arbitrary <img> tags if <Image> is not in registry (use standard img or mock).
   - Icons: Import from "@/components/ui-library/Icons". Example: import { Check } from "@/components/ui-library/Icons"

3. EXPLANATION: Explain why you chose these components and layout.

Output must be a structured JSON object matching the schema: { plan, code, explanation }.
DO NOT use markdown code blocks (like \`\`\`json). Return ONLY the raw JSON string.
`;

    // const result = await streamObject({
    //   model,
    //   schema: generateSchema,
    //   system: systemPrompt,
    //   messages,
    //   output: "object",
    // });

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "stepfun/step-3.5-flash:free",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const parsed = tryParseJson(rawContent);

    if (!parsed) {
      return NextResponse.json({
        success: false,
        message: "AI returned non-JSON output. Please try again.",
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "UI generated successfully",
      data: parsed,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to generate UI. Please try again.",
      data: null,
    });
  }
}
