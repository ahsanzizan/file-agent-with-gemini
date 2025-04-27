import { GenerationConfig, SchemaType } from "@google/generative-ai";

export const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 1,
  topK: 40,
  maxOutputTokens: 2000,
  responseMimeType: "application/json",
  responseSchema: {
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        action: {
          type: SchemaType.STRING,
          description: "The action to be performed.",
        },
        source: {
          type: SchemaType.STRING,
          description:
            "The source file to pass to the action execution function.",
        },
        sources: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
            description: "The source file.",
          },
          description:
            "The source files to pass into the action execution function.",
        },
        destination: {
          type: SchemaType.STRING,
          description:
            "The destination to store the output at (if there is any).",
        },
      },
      required: ["action", "source", "sources", "destination"],
    },
    description: "Array of actions plan.",
  },
};
