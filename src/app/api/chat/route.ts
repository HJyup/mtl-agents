import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { messages } = body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7
    });

    const reply = completion.choices[0].message;

    return NextResponse.json({
      success: true,
      message: reply
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process chat",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined
      },
      { status: 500 }
    );
  }
}
