"use client";

import { MessageResponse, ParsedMessage } from "@/types/chat";

interface CalendarModeProps {
  onResponse: (response: MessageResponse) => void;
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
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

export default function useCalendarMode({
  onResponse,
  setIsLoading,
  setAuthError
}: CalendarModeProps) {
  const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const timeMin = today.toISOString();
      const timeMax = nextWeek.toISOString();

      const response = await fetch(
        `/api/calendar/fetch?timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(timeMax)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Not authenticated") {
          setAuthError("Your session has expired. Please sign in again.");
          return [];
        }

        console.error("Error fetching calendar events:", errorData);
        return [];
      }

      const data = await response.json();
      return data.success ? data.events : [];
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return [];
    }
  };

  const parseMessageWithAI = async (
    msg: string,
    context?: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);

      const calendarEvents = await fetchCalendarEvents();

      console.log(context);

      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: msg,
          calendarEvents,
          context
        })
      });

      const parseData = await parseResponse.json();

      if (!parseData.success) {
        throw new Error(parseData.error || "Failed to parse message");
      }

      const parsedMessage = parseData.parsed as ParsedMessage;

      if (!parsedMessage.isValid) {
        setIsLoading(false);
        return `I understand you said: "${msg}", but I'm not sure how to handle that as an event. ${parsedMessage.reasonInvalid ||
          ""}`;
      }

      if (
        parsedMessage.actions.includes("search_contacts") &&
        parsedMessage.person
      ) {
        const contactResponse = await fetch(
          `/api/contacts?query=${encodeURIComponent(parsedMessage.person)}`
        );
        const contactData = await contactResponse.json();

        if (contactData.error === "Not authenticated") {
          setAuthError("Your session has expired. Please sign in again.");
          setIsLoading(false);
          return null;
        }

        let attendeeEmail = "";
        if (contactData.success && contactData.contact) {
          attendeeEmail = contactData.contact.email;
        }

        if (
          parsedMessage.actions.includes("create_event") &&
          parsedMessage.eventDetails &&
          parsedMessage.eventDetails.start &&
          parsedMessage.eventDetails.end
        ) {
          const calendarResponse = await fetch("/api/calendar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              eventDetails: parsedMessage.eventDetails,
              description: parsedMessage.description,
              attendeeEmail
            })
          });

          const calendarData = await calendarResponse.json();
          setIsLoading(false);

          if (calendarData.error === "Not authenticated") {
            setAuthError("Your session has expired. Please sign in again.");
            return null;
          }

          if (!calendarData.success) {
            throw new Error(calendarData.details || "Calendar API error");
          }

          const startTime = new Date(parsedMessage.eventDetails.start.dateTime);
          const endTime = new Date(parsedMessage.eventDetails.end.dateTime);

          return `I've scheduled ${parsedMessage.eventType} with ${parsedMessage.person} for ${startTime.toLocaleDateString()} from ${startTime.toLocaleTimeString()} to ${endTime.toLocaleTimeString()}.${attendeeEmail
            ? ` An invitation has been sent to ${attendeeEmail}.`
            : " I couldn't find their email in your contacts."}`;
        }

        setIsLoading(false);
        return `I found information about ${parsedMessage.person}${attendeeEmail
          ? ` with email ${attendeeEmail}`
          : ", but couldn't find their email"}, but couldn't create an event due to missing event details.`;
      }

      setIsLoading(false);
      return `I understood that you want to schedule ${parsedMessage.eventType}${parsedMessage.person
        ? ` with ${parsedMessage.person}`
        : ""}, but I need more information to proceed.`;
    } catch (error) {
      setIsLoading(false);
      console.error("Error processing message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return `I couldn't process your request. ${errorMessage}`;
    }
  };

  const processMessage = async (
    userMessage: string,
    context?: string
  ): Promise<void> => {
    onResponse({
      message: `You: ${userMessage}`,
      timestamp: new Date().toISOString(),
      isError: false
    });

    const response = await parseMessageWithAI(userMessage, context);

    if (response) {
      onResponse({
        message: response,
        timestamp: new Date().toISOString(),
        isError: false
      });
    }
  };

  return { processMessage };
}
