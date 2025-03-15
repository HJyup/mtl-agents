import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { google } from "googleapis";
import OpenAI from "openai";
import getCalendarContext from "@/lib/calendar/context";
import generatePrompt from "@/lib/calendar/prompt";

export type Response = {
  eventType: string;
  description: string;
  person: string;
  eventDetails: {
    summary: string;
    start: {
      dateTime: string;
      timeZone: string;
    };
    end: {
      dateTime: string;
      timeZone: string;
    };
  };
  isValid: boolean;
  reasonInvalid: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

const eventDetailsSchema = z.object({
  summary: z.string(),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
});

const calendarEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  start: z.object({
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
    date: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
    date: z.string().optional(),
  }),
  attendees: z
    .array(
      z.object({
        email: z.string(),
        displayName: z.string().optional(),
      }),
    )
    .optional(),
});

export const calendarRouter = createTRPCRouter({
  createEvent: protectedProcedure
    .input(
      z.object({
        eventDetails: eventDetailsSchema,
        description: z.string().optional(),
        attendeeEmail: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const token = ctx.session?.accessToken;

        googleClient.setCredentials({
          access_token: token,
        });

        const calendar = google.calendar({
          version: "v3",
          auth: googleClient,
        });

        const event = {
          summary: input.eventDetails.summary,
          description: input.description,
          start: input.eventDetails.start,
          end: input.eventDetails.end,
          attendees:
            input.attendeeEmail && input.attendeeEmail !== ""
              ? [{ email: input.attendeeEmail }]
              : [],
          reminders: {
            useDefault: true,
          },
        };

        const result = await calendar.events.insert({
          calendarId: "primary",
          sendUpdates: input.attendeeEmail ? "all" : "none",
          requestBody: event,
        });

        return {
          success: true,
          event: result.data,
        };
      } catch (error) {
        console.error("Error creating calendar event:", error);
        throw new Error("Failed to create calendar event");
      }
    }),

  listEvents: protectedProcedure
    .input(
      z.object({
        timeMin: z.string(),
        timeMax: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const token = ctx.session?.accessToken;

        googleClient.setCredentials({
          access_token: token,
        });

        const calendar = google.calendar({
          version: "v3",
          auth: googleClient,
        });

        const result = await calendar.events.list({
          calendarId: "primary",
          timeMin: input.timeMin,
          timeMax: input.timeMax,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 30,
        });

        const events =
          result.data.items?.map((event) => ({
            id: event.id ?? "",
            summary: event.summary ?? "",
            start: event.start ?? { dateTime: "", date: "" },
            end: event.end ?? { dateTime: "", date: "" },
            attendees:
              event.attendees?.map((attendee) => ({
                email: attendee.email ?? "",
                displayName: attendee.displayName ?? "",
              })) ?? [],
          })) ?? [];

        return {
          success: true,
          events,
        };
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        throw new Error("Failed to fetch calendar events");
      }
    }),

  analyzeMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        calendarEvents: z.array(calendarEventSchema).optional(),
        context: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const events = input.calendarEvents ?? [];

        let extraContext = "";
        if (input.context) {
          extraContext = `
          # Context. You can use them to help you understand the user's request. Maybe he wants to schedule a meeting based on previous responses. If they are not related to request from user, you must to ignore this context.
          ${input.context}
          `;
        }

        let calendarContext = "";
        if (events.length > 0) {
          calendarContext = await getCalendarContext(events);
        }

        const systemPrompt = generatePrompt(calendarContext, extraContext);

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
        console.error("Error in parse API:", error);
        throw new Error("Failed to process message");
      }
    }),
});
