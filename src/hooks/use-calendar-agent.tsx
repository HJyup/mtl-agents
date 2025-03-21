"use client";

import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

type CalendarEvent = RouterOutputs["calendar"]["listEvents"]["events"][number];

enum CalendarResponses {
  EVENT_SCHEDULED = "I've scheduled {eventType} for {date} from {startTime} to {endTime}.",
  EVENT_SCHEDULED_WITH_ATTENDEE = "I've scheduled {eventType} with {person} for {date} from {startTime} to {endTime}. {emailStatus}",
  INVALID_REQUEST = 'I understand you said: "{message}", but I\'m not sure how to handle that as an event. {reason}',
  NEED_MORE_INFO = "I understood that you want to schedule {eventType}{withPerson}, but I need more information to proceed.",
  ERROR = "I couldn't process your request. {error}",
  EMAIL_SENT = " An invitation has been sent to {email}.",
  EMAIL_NOT_FOUND = " I couldn't find their email in your contacts.",
}

const formatCalendarResponse = (
  template: string,
  params: Record<string, string>,
) => {
  return Object.entries(params).reduce((str, [key, value]) => {
    return str.replace(`{${key}}`, value);
  }, template);
};

interface CalendarModeProps {
  onResponse: (response: {
    message: string;
    prefix: string;
    timestamp: string;
    isError: boolean;
  }) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export default function useCalendarMode({
  onResponse,
  setIsLoading,
}: CalendarModeProps) {
  const listEvents = api.calendar.listEvents.useMutation();
  const searchContact = api.contacts.searchContact.useMutation();
  const analyzeMessage = api.calendar.analyzeMessage.useMutation();
  const createEvent = api.calendar.createEvent.useMutation();

  const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    try {
      const times = [
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 7)),
      ];

      if (!times[0] || !times[1]) {
        throw new Error("Failed to get calendar events");
      }

      const result = await listEvents.mutateAsync({
        timeMin: times[0].toISOString(),
        timeMax: times[1].toISOString(),
      });
      return result.events ?? [];
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return [];
    }
  };

  const parseMessageWithAI = async (
    msg: string,
    context?: string,
  ): Promise<string | null> => {
    try {
      setIsLoading(true);

      const events = await getCalendarEvents();

      // TODO: create a separate mapper with that Awaited<ReturnType<typeof getCalendarEvents>>
      const calendarEvents = events.map((event) => ({
        id: event.id ?? "",
        summary: event.summary ?? "",
        start: {
          dateTime: event.start.dateTime ?? undefined,
          date: event.start.date ?? undefined,
          timeZone: event.start.timeZone ?? undefined,
        },
        end: {
          dateTime: event.end.dateTime ?? undefined,
          date: event.end.date ?? undefined,
          timeZone: event.end.timeZone ?? undefined,
        },
        attendees: event.attendees?.map((a) => ({
          email: a.email,
          displayName: a.displayName ?? undefined,
        })),
      }));

      const result = await analyzeMessage.mutateAsync({
        message: msg,
        calendarEvents,
        context,
      });

      if (!result.success) {
        throw new Error(
          result.response.reasonInvalid ?? "Failed to parse message",
        );
      }

      const message = result.response;

      if (!message.isValid) {
        setIsLoading(false);
        return formatCalendarResponse(CalendarResponses.INVALID_REQUEST, {
          message: msg,
          reason: message.reasonInvalid ?? "",
        });
      }

      let attendeeEmail = undefined;
      if (message.person) {
        const contactResult = await searchContact.mutateAsync({
          query: message.person,
        });
        if (contactResult.success && contactResult.contact) {
          attendeeEmail = contactResult.contact.email;
        }
      }

      if (message.eventDetails?.start && message.eventDetails?.end) {
        const calendarResult = await createEvent.mutateAsync({
          eventDetails: message.eventDetails,
          description: message.description,
          attendeeEmail,
        });

        setIsLoading(false);

        if (!calendarResult.success) {
          return null;
        }

        if (!calendarResult.success) {
          throw new Error("Calendar API error");
        }

        const startTime = new Date(message.eventDetails.start.dateTime);
        const endTime = new Date(message.eventDetails.end.dateTime);

        const emailStatus = attendeeEmail
          ? formatCalendarResponse(CalendarResponses.EMAIL_SENT, {
              email: attendeeEmail,
            })
          : CalendarResponses.EMAIL_NOT_FOUND;

        return attendeeEmail
          ? formatCalendarResponse(
              CalendarResponses.EVENT_SCHEDULED_WITH_ATTENDEE,
              {
                eventType: message.eventType,
                description: message.description,
                person: message.person,
                date: startTime.toLocaleDateString(),
                startTime: startTime.toLocaleTimeString(),
                endTime: endTime.toLocaleTimeString(),
                emailStatus,
              },
            )
          : formatCalendarResponse(CalendarResponses.EVENT_SCHEDULED, {
              description: message.description,
              eventType: message.eventType,
              date: startTime.toLocaleDateString(),
              startTime: startTime.toLocaleTimeString(),
              endTime: endTime.toLocaleTimeString(),
            });
      }

      setIsLoading(false);
      return formatCalendarResponse(CalendarResponses.NEED_MORE_INFO, {
        eventType: message.eventType,
        withPerson: message.person ? ` with ${message.person}` : "",
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error processing message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return formatCalendarResponse(CalendarResponses.ERROR, {
        error: errorMessage,
      });
    }
  };

  const processMessage = async (
    userMessage: string,
    context?: string,
  ): Promise<void> => {
    onResponse({
      message: `You: ${userMessage}`,
      timestamp: new Date().toISOString(),
      prefix: "cl",
      isError: false,
    });

    const response = await parseMessageWithAI(userMessage, context);

    if (response) {
      onResponse({
        message: response,
        prefix: "cl",
        timestamp: new Date().toISOString(),
        isError: false,
      });
    }
  };

  return { processMessage };
}
