import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GaxiosError } from "gaxios";

interface EventDetails {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

interface CalendarRequestBody {
  eventDetails: EventDetails;
  attendeeEmail?: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as NextRequest });

    if (!token?.accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { eventDetails, description, attendeeEmail } =
      (await request.json()) as CalendarRequestBody;

    if (!eventDetails?.summary || !eventDetails?.start || !eventDetails?.end) {
      return NextResponse.json(
        { success: false, error: "Missing required event details" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken
    });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client
    });

    const event = {
      summary: eventDetails.summary,
      description: description,
      start: eventDetails.start,
      end: eventDetails.end,
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      reminders: {
        useDefault: true
      }
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: attendeeEmail ? "all" : "none",
      requestBody: event
    });

    return NextResponse.json({
      success: true,
      event: result.data
    });
  } catch (error: unknown) {
    console.error("Error creating calendar event:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode = (error as GaxiosError)?.response?.status || 500;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create calendar event",
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
