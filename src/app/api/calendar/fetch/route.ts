import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GaxiosError } from "gaxios";

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as NextRequest });

    if (!token?.accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { success: false, error: "Missing timeMin or timeMax parameters" },
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

    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 30
    });

    console.log("result", result);

    const events =
      result.data.items?.map((event) => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        attendees:
          event.attendees?.map((attendee) => ({
            email: attendee.email,
            displayName: attendee.displayName
          })) || []
      })) || [];

    return NextResponse.json({
      success: true,
      events
    });
  } catch (error: unknown) {
    console.error("Error fetching calendar events:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode = (error as GaxiosError)?.response?.status || 500;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch calendar events",
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
