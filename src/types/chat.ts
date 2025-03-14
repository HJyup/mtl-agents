export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MessageResponse {
  message: string;
  timestamp: string;
  isError: boolean;
}

export interface CalendarEvent {
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

export interface ParsedMessage {
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
