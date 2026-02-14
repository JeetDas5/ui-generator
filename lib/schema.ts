import { z } from "zod";

// Schema for the planner's output
export const planSchema = z.object({
  goal: z.string().describe("The user's intent or goal."),
  layout: z
    .string()
    .describe(
      "The chosen layout structure (e.g., 'SidebarLayout', 'SingleColumn', 'Dashboard')."
    ),
  components: z
    .array(z.string())
    .describe("List of components from the registry to use."),
});

// Schema for the full generation (Plan + Code + Explanation)
export const generateSchema = z.object({
  plan: planSchema,
  code: z
    .string()
    .describe("The full React component code using the fixed library."),
  explanation: z.string().describe("A brief explanation of design choices."),
});

export type GenerateResponse = z.infer<typeof generateSchema>;
