import { promises as fs } from "fs";
import path from "path";

export async function getComponentSource() {
  const libraryPath = path.join(process.cwd(), "components", "ui-library");
  // Note: I am assuming components are in root/components based on my previous file creates.
  // Wait, I created them in c:/Users/KIIT0001/OneDrive/Desktop/Code Playground/Internshala/ryze-ai/ui-generator/components/ui-library
  // which is project_root/components/ui-library.
  // So standard path is correct.

  const files: Record<string, string> = {};

  try {
    const dir = await fs.readdir(libraryPath);
    for (const file of dir) {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const content = await fs.readFile(
          path.join(libraryPath, file),
          "utf-8"
        );
        // Sandpack expects files to be like "/components/ui-library/Button.tsx"
        // We can map them to strict paths.
        // The AI generates: import { Button } from "@/components/ui-library/Button"
        // So we need to map "@/components/ui-library/Button" to this content?
        // Sandpack supports aliases?
        // Actually, mapped files in sandpack are usually relative.
        // If we put them in "/components/ui-library/Button.tsx", basic imports might work if we configure tsconfig or aliases in Sandpack.
        // But simpler is to put them in the root of sandpack or configure paths.

        // Let's store them with the full path expected by the import.
        // AI uses: "@/components/ui-library/..."
        // We can set Sandpack files with keys like "/components/ui-library/Button.tsx"
        // And configure tsconfig in Sandpack to map "@/*" to "./*"

        files[`/components/ui-library/${file}`] = content;
      }
    }

    // Also read lib/utils.ts because components use it.
    const utilsContent = await fs.readFile(
      path.join(process.cwd(), "lib", "utils.ts"),
      "utf-8"
    );
    files["/lib/utils.ts"] = utilsContent;
  } catch (e) {
    console.error("Error reading component library:", e);
  }

  return files;
}
