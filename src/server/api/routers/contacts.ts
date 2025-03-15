import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { google } from "googleapis";

const googleClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export const contactsRouter = createTRPCRouter({
  searchContact: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const token = ctx.session?.accessToken;

        googleClient.setCredentials({
          access_token: token,
        });

        const people = google.people({
          version: "v1",
          auth: googleClient,
        });

        await people.people.searchContacts({
          readMask: "names,emailAddresses,nicknames",
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await people.people.searchContacts({
          query: input.query,
          readMask: "names,emailAddresses,nicknames",
        });

        const contacts = response.data.results ?? [];
        let contactInfo = null;

        if (contacts.length > 0 && contacts[0]?.person) {
          const person = contacts[0].person;
          contactInfo = {
            name: person.names?.[0]?.displayName ?? input.query,
            email: person.emailAddresses?.[0]?.value ?? "",
          };
        }

        return {
          success: true,
          contact: contactInfo,
        };
      } catch (error) {
        console.error("Error searching contacts:", error);
        throw new Error("Failed to search contacts");
      }
    }),
});
