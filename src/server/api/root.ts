import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { calendarRouter } from "./routers/calendar";
import { contactsRouter } from "./routers/contacts";
import { chatRouter } from "./routers/chat";
import { thingsRouter } from "./routers/things";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  calendar: calendarRouter,
  contacts: contactsRouter,
  chat: chatRouter,
  things: thingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
