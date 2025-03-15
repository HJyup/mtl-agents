import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import OpenAI from "openai";
import generatePrompt from "@/lib/things/prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ThingType = "add" | "search";

export type Response = {
  type: ThingType;
  query: string;
  title: string;
  notes: string;
  checklist: string;
  when: string;
};

export const thingsRouter = createTRPCRouter({
  extractValues: publicProcedure
    .input(
      z.object({
        message: z.string(),
        context: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = generatePrompt(input.context ?? "");

        const completion = await openai.chat.completions.create({
          model: "o3-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message },
          ],
          response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message.content;

        if (responseContent === null || responseContent === undefined) {
          throw new Error("Empty response from AI service");
        }

        return {
          success: true,
          response: JSON.parse(responseContent) as Response,
        };
      } catch (error) {
        console.error("Error in chat API:", error);
        throw new Error("Failed to process chat");
      }
    }),
});
