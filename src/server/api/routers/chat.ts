import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const completion = await openai.chat.completions.create({
          model: "o3-mini",
          messages: input.messages,
        });

        return {
          success: true,
          message: completion.choices[0]?.message,
        };
      } catch (error) {
        console.error("Error in chat API:", error);
        throw new Error("Failed to process chat");
      }
    }),
});
