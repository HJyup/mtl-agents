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
          # My Calendar Events
          - Here are my existing calendar events that you should consider when scheduling.
          - When suggesting times for new events, avoid conflicts with these existing events.
          - Some facts about me. I don't like to be contacted before 8:00 or after 13:00.
          - For meetings, I prefer to have them in the before 17:00.
          - I don't like to have meetings on Friday after 17:00.
          
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
          `;
};

export default getCalendarContext;
