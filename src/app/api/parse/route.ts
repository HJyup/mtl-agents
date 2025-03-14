import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ParsedOutput {
  eventType: string;
  description?: string;
  person?: string;
  eventDetails?: {
    summary: string;
    start?: {
      dateTime: string;
      timeZone: string;
    };
    end?: {
      dateTime: string;
      timeZone: string;
    };
  };
  actions: string[];
  isValid: boolean;
  reasonInvalid?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
    date?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
    date?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Europe/London"
    });

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { message, calendarEvents, context } = body;
    const events = (calendarEvents as CalendarEvent[]) || [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "No message provided or invalid message format"
        },
        { status: 400 }
      );
    }

    console.log(context);

    let extraContext = "";
    if (context) {
      extraContext = `
      # Context. You can use them to help you understand the user's request. Maybe he wants to schedule a meeting based on previous responses. If they are not related to request from user, you must to ignore this context.
      ${context}
      `;
    }

    let calendarContext = "";
    if (events.length > 0) {
      calendarContext = `
      # Your Calendar Events
      Here are your existing calendar events that you should consider when scheduling:
      
      ${events
        .map((event) => {
          const startDateTime = event.start.dateTime || event.start.date || "";
          const endDateTime = event.end.dateTime || event.end.date || "";
          const startDate = new Date(startDateTime);
          const endDate = new Date(endDateTime);

          return `- ${
            event.summary
          }: ${startDate.toLocaleDateString()} from ${startDate.toLocaleTimeString()} to ${endDate.toLocaleTimeString()}${
            event.attendees && event.attendees.length > 0
              ? ` with ${event.attendees
                  .map((a) => a.displayName || a.email)
                  .join(", ")}`
              : ""
          }`;
        })
        .join("\n")}
      
      When suggesting times for new events, avoid conflicts with these existing events.
      `;
    }

    const systemPrompt = `
      You are a calendar assistant that interprets natural language requests for scheduling events.
      Your task is to extract structured data from user messages about calendar events. My timezone is live in London.
      Today's date is ${currentDate}.
      ${calendarContext}
      
      ${extraContext}

      # Expected Output Format (JSON)
      {
        "eventType": "meeting|call|appointment|dinner|etc",
        "description": "brief description of the event. use context from previous responses to help you understand the user's request and summarize what we want to do. If you don't have any context and meeting straight forward, you can leave it blank.",
        "person": "name of person mentioned (if any)",
        "eventDetails": {
          "summary": "brief description of the event",
          "start": {
            "dateTime": "ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
            "timeZone": "user's timezone or default to UTC"
          },
          "end": {
            "dateTime": "ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
            "timeZone": "user's timezone or default to UTC"
          }
        },
        "actions": ["search_contacts", "create_event", "etc"],
        "isValid": true/false,
        "reasonInvalid": "explanation if isValid is false"
      }

      # Guidelines
      - Extract specific dates, times, and durations when provided with precision
      - For ambiguous time references (e.g., "dinner"), use conventional time ranges (dinner = 6-8 PM)
      - Preserve exact names of people mentioned in the request without modifications
      - Set isValid to false only for non-calendar related requests
      - Include comprehensive actions needed to fulfill the request (create_event, search_contacts, etc.)
      - Always use ISO 8601 format (YYYY-MM-DDTHH:MM:SS) with the correct timezone
      - For events without explicit times, assign reasonable defaults based on event type and cultural norms
      - Accurately capture the person's name when the user specifies meeting participants
      - Generate complete eventDetails when minimal information is provided, using context clues
      - Prioritize avoiding conflicts with existing calendar events - this is critical
      - Default to "other" as event type only when the event category is genuinely ambiguous
      - Ensure all suggested times are future-dated and align with normal human scheduling patterns
      - For time conflicts, provide at least two alternative time slots that avoid existing commitments
      - Consider event duration when suggesting times (meetings typically 30-60 min, meals 1-2 hours)
      - For recurring events, clearly identify the pattern and suggest appropriate scheduling
      - For event description, you can use the context from previous responses to help you understand the user's request and summarize what we want to do. If you don't have any context and meeting straight forward, you can leave it blank.
    `;

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      return NextResponse.json(
        {
          success: false,
          error: "Error communicating with AI service",
          details:
            process.env.NODE_ENV === "development"
              ? (openaiError as Error).message
              : undefined
        },
        { status: 502 }
      );
    }

    const responseContent = completion.choices[0].message.content;

    if (!responseContent) {
      return NextResponse.json(
        { success: false, error: "Empty response from AI service" },
        { status: 500 }
      );
    }

    try {
      const parsedData = JSON.parse(responseContent) as ParsedOutput;

      if (
        typeof parsedData !== "object" ||
        typeof parsedData.isValid !== "boolean" ||
        !Array.isArray(parsedData.actions)
      ) {
        throw new Error("Invalid response structure");
      }

      return NextResponse.json({
        success: true,
        parsed: parsedData
      });
    } catch (parseError) {
      console.error(
        "Failed to parse OpenAI JSON response:",
        parseError,
        responseContent
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response format from AI service",
          details:
            process.env.NODE_ENV === "development" ? responseContent : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in parse API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined
      },
      { status: 500 }
    );
  }
}
