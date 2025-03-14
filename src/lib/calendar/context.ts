type CalendarEvent = {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    timeZone?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    timeZone?: string;
    date?: string;
  };
  attendees?: { displayName?: string; email: string }[];
};

const getCalendarContext = async (events: CalendarEvent[]) => {
  return `
          # Your Calendar Events
          Here are your existing calendar events that you should consider when scheduling:
          
          ${events
            .map((event) => {
              const startDateTime =
                event.start.dateTime ?? event.start.date ?? "";
              const endDateTime = event.end.dateTime ?? event.end.date ?? "";
              const startDate = new Date(startDateTime);
              const endDate = new Date(endDateTime);

              return `- ${
                event.summary
              }: ${startDate.toLocaleDateString()} from ${startDate.toLocaleTimeString()} to ${endDate.toLocaleTimeString()}${
                event.attendees && event.attendees.length > 0
                  ? ` with ${event.attendees
                      .map((a) => a.displayName ?? a.email)
                      .join(", ")}`
                  : ""
              }`;
            })
            .join("\n")}
          
          When suggesting times for new events, avoid conflicts with these existing events.
          `;
};

export default getCalendarContext;
