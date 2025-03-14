// Message types
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MessageResponse {
  message: string;
  timestamp: string;
  isError?: boolean;
}

// Event types
export interface EventTime {
  dateTime: string;
  timeZone: string;
}

export interface EventDetails {
  summary: string;
  start?: EventTime;
  end?: EventTime;
}

export interface ParsedMessage {
  eventType: string;
  person?: string;
  eventDetails?: EventDetails;
  actions: string[];
  isValid: boolean;
  reasonInvalid?: string;
}
