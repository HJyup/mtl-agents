import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { GaxiosError } from "gaxios";

interface ContactInfo {
  name: string;
  email: string;
}

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
    const query = searchParams.get("query");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken
    });

    const people = google.people({
      version: "v1",
      auth: oauth2Client
    });

    if (!query) {
      return NextResponse.json(
        { success: false, error: "No query provided" },
        { status: 400 }
      );
    }

    await people.people.searchContacts({
      readMask: "names,emailAddresses,nicknames"
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await people.people.searchContacts({
      query: query,
      readMask: "names,emailAddresses,nicknames"
    });

    const contacts = response.data.results || [];
    let contactInfo: ContactInfo | null = null;

    if (contacts.length > 0 && contacts[0].person) {
      const person = contacts[0].person;
      contactInfo = {
        name: person.names?.[0]?.displayName || query,
        email: person.emailAddresses?.[0]?.value || ""
      };
    }

    return NextResponse.json({
      success: true,
      contact: contactInfo
    });
  } catch (error: unknown) {
    console.error("Error searching contacts:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode = (error as GaxiosError)?.response?.status || 500;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search contacts",
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
