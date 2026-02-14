"use client";

import * as React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Send,
  RotateCcw,
  Code,
  Eye,
  Terminal,
  Sparkles,
  Bot,
  User,
} from "lucide-react";

// Define the shape of the AI response on the client side validation
const aiSchema = z.object({
  plan: z
    .object({
      goal: z.string(),
      layout: z.string(),
      components: z.array(z.string()),
    })
    .optional(),
  code: z.string(),
  explanation: z.string(),
});

export default function MainLayout({
  componentFiles,
}: {
  componentFiles: Record<string, string>;
}) {
  const [messages, setMessages] = React.useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<
    "preview" | "code" | "console"
  >("preview");

  // State for the generation result

  // State for the generation result
  const [generation, setGeneration] = React.useState<z.infer<
    typeof aiSchema
  > | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    console.log(
      "Generation updated:",
      generation
        ? {
            hasCode: !!generation.code,
            codeLength: generation.code?.length,
            hasExplanation: !!generation.explanation,
            hasPlan: !!generation.plan,
          }
        : null
    );
  }, [generation]);

  React.useEffect(() => {
    console.log(
      "componentFiles keys:",
      Object.keys(componentFiles).length > 0
        ? Object.keys(componentFiles)
        : "EMPTY"
    );
  }, [componentFiles]);

  // Default code with a nice placeholder
  const fixImportsForSandpack = (code: string): string => {
    // Convert @/components/... to ./components/...
    return code.replace(/@\/components\//g, "./components/");
  };

  const currentCode = `export default function App() {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', color: '#000' }}>
        <h1 className="text-4xl font-bold">Hello World</h1>
      </div>
    )
  }`;

  React.useEffect(() => {
    if (currentCode && generation?.code) {
      console.log(
        "Generated code (first 300 chars):",
        generation.code.substring(0, 300)
      );
      console.log(
        "Fixed code (first 300 chars):",
        currentCode.substring(0, 300)
      );
    }
  }, [currentCode, generation?.code]);
  async function submit(formData: {
    messages: Array<{ role: string; content: string }>;
  }) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log("Response: ", result);

      if (result.success) {
        try {
          const rawData = result.data;
          let parsedData = rawData;

          if (typeof rawData === "string") {
            let cleanData = rawData.trim();
            // Remove potential markdown code blocks
            if (cleanData.startsWith("```")) {
              cleanData = cleanData
                .replace(/^```(json)?\s*/, "")
                .replace(/\s*```$/, "");
            }
            parsedData = JSON.parse(cleanData);
          }

          const normalizeAiData = (value: unknown) => {
            if (!value || typeof value !== "object") return value;

            const data = value as Record<string, unknown>;
            const normalized: Record<string, unknown> = { ...data };

            if (typeof normalized.plan === "string") {
              normalized.plan = {
                goal: normalized.plan,
                layout: "Custom",
                components: [],
              };
            } else if (
              normalized.plan &&
              typeof normalized.plan === "object" &&
              !Array.isArray(normalized.plan)
            ) {
              const plan = normalized.plan as Record<string, unknown>;
              normalized.plan = {
                goal:
                  typeof plan.goal === "string" ? plan.goal : "UI generation",
                layout:
                  typeof plan.layout === "string" ? plan.layout : "Custom",
                components: Array.isArray(plan.components)
                  ? plan.components.map((item) => String(item))
                  : [],
              };
            }

            return normalized;
          };

          const validated = aiSchema.safeParse(normalizeAiData(parsedData));
          console.log("Validation result:", validated);
          if (!validated.success) {
            console.error("Validation errors:", validated.error);
            throw new Error("Invalid AI response shape");
          }
          if (!validated.data.code) {
            console.error("No code in validated data:", validated.data);
            throw new Error("No code generated");
          }

          console.log(
            "Setting generation with code length:",
            validated.data.code.length
          );
          setGeneration(validated.data);

          // Add assistant message
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: validated.data.explanation },
          ]);
        } catch (e) {
          console.error("JSON Parse Error:", e);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Sorry, I received an invalid response from the AI. Please try again.",
            },
          ]);
        }
      } else {
        console.error("Generation error", result.message);
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error: " + result.message,
          },
        ]);
      }
    } catch (error) {
      console.error("Network error", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, a network error occurred." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: "user", content: input };
    const newHistory = [...messages, newMsg];
    setMessages(newHistory);
    setInput("");

    // Submit the full history to the backend
    submit({ messages: newHistory });
  };

  // React template requires files in /src
  const srcComponentFiles = Object.entries(componentFiles).reduce(
    (acc, [key, value]) => {
      // key is like "/components/..." or "/lib/..."
      // valid keys for sandpack file map should be absolute paths
      acc[`/src${key}`] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  // Determine which code to show
  const activeCode = generation?.code
    ? fixImportsForSandpack(generation.code)
    : currentCode;

  const files = {
    "/src/App.tsx": activeCode,
    ...srcComponentFiles,
    "/src/index.tsx": `import React from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    "/src/globals.css": `
@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
`,
    "/public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI UI Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: "hsl(var(--border))",
              input: "hsl(var(--input))",
              ring: "hsl(var(--ring))",
              background: "hsl(var(--background))",
              foreground: "hsl(var(--foreground))",
              primary: {
                DEFAULT: "hsl(var(--primary))",
                foreground: "hsl(var(--primary-foreground))",
              },
              secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))",
              },
              destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))",
              },
              muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))",
              },
              accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))",
              },
              popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))",
              },
              card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))",
              },
            },
          },
        },
      }
    </script>
    <style>
      html, body, #root {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    "/tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ESNext",
          module: "ESNext",
          jsx: "react-jsx",
          esModuleInterop: true,
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
          },
        },
      },
      null,
      2
    ),
    "/package.json": JSON.stringify(
      {
        dependencies: {
          "lucide-react": "latest",
          clsx: "latest",
          "tailwind-merge": "latest",
          react: "latest",
          "react-dom": "latest",
          "class-variance-authority": "latest",
          "@radix-ui/react-slot": "latest",
        },
      },
      null,
      2
    ),
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
      {/* Left Panel - Chat */}
      <div className="w-[400px] border-r border-border flex flex-col bg-muted/5">
        <div className="p-4 border-b border-border bg-background flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-md font-bold leading-tight">Antigravity UI</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Deterministic Agent
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10 opacity-50">
              <Sparkles className="w-10 h-10 mx-auto mb-2" />
              <p>Describe your UI to get started.</p>
              <p className="text-xs">
                e.g., "Create a dark mode CRM dashboard"
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 text-sm",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border"
                )}
              >
                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={cn(
                  "rounded-xl px-4 py-2 max-w-[85%]",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border shadow-sm"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={14} />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm w-full space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Thinking
                  </div>
                  {generation?.plan && !generation.code && (
                    <div className="text-xs text-muted-foreground">
                      Planning: {generation.plan.goal}
                    </div>
                  )}
                  {generation?.code && (
                    <div className="text-xs text-muted-foreground">
                      Generated code.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your UI..."
              className="flex-1 bg-muted/50 border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        <div className="border-b border-border/10 px-4 py-2 flex items-center justify-between bg-zinc-900 text-zinc-400">
          <div className="flex space-x-1 bg-zinc-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "preview"
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "hover:text-white"
              )}
            >
              <Eye size={12} /> Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "code"
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "hover:text-white"
              )}
            >
              <Code size={12} /> Code
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "console"
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "hover:text-white"
              )}
            >
              <Terminal size={12} /> Console
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {generation?.plan?.layout && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {generation.plan.layout}
              </span>
            )}
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              )}
            />
            {isLoading ? "Generating..." : "Ready"}
          </div>
        </div>

        <div className="flex-1 overflow-y-scroll relative">
          <SandpackProvider
            key={
              generation?.code
                ? `generated-${generation.code.length}`
                : "initial"
            }
            files={files}
            theme="dark"
            template="react"
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
            }}
          >
            <SandpackLayout className="h-full border-none bg-zinc-950">
              <div
                className={cn(
                  "flex-1 flex flex-col h-full relative overflow-hidden",
                  activeTab === "preview" ? "flex" : "hidden"
                )}
              >
                <SandpackPreview
                  className="flex-1 h-full w-full"
                  showOpenInCodeSandbox={false}
                  showRefreshButton={true}
                />
              </div>
              <div
                className={cn(
                  "flex-1 h-full relative",
                  activeTab === "code" ? "block" : "hidden"
                )}
              >
                <SandpackCodeEditor
                  className="h-full font-mono"
                  showTabs
                  showLineNumbers
                  readOnly={false} // Allow edits!
                  showInlineErrors
                  wrapContent
                />
              </div>
              <div
                className={cn(
                  "flex-1 h-full relative bg-zinc-950 font-mono",
                  activeTab === "console" ? "block" : "hidden"
                )}
              >
                <SandpackConsole className="h-full w-full" />
              </div>
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
