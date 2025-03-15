import buildThingLink from "@/lib/things/link-builder";
import { api } from "@/trpc/react";

interface ThingsModeProps {
  onResponse: (response: {
    message: string;
    prefix: string;
    timestamp: string;
    isError: boolean;
  }) => void;
  setIsLoading: (isLoading: boolean) => void;
}

enum ThingsResponses {
  SEARCH_QUERY = "I've created a search query for you. {title}",
  ADD_TASK = "I've added a task to your Things list. {title}",
  INVALID_REQUEST = "Sorry, I don't understand your request. Please try again.",
}

const formatThingsResponse = (
  template: string,
  params: Record<string, string>,
) => {
  return Object.entries(params).reduce((str, [key, value]) => {
    return str.replace(`{${key}}`, value);
  }, template);
};

export default function useThingsMode({
  onResponse,
  setIsLoading,
}: ThingsModeProps) {
  const thingsMutation = api.things.extractValues.useMutation();

  const exportThingsLink = async (
    message: string,
    context?: string,
  ): Promise<string | null> => {
    try {
      setIsLoading(true);

      const response = await thingsMutation.mutateAsync({
        message,
        context,
      });

      setIsLoading(false);

      if (!response.success) {
        throw new Error("Failed to get response");
      }

      const link = buildThingLink(response.response);

      window.open(link, "_blank");

      return response.response.type === "add"
        ? formatThingsResponse(ThingsResponses.ADD_TASK, {
            title: response.response.title,
          })
        : formatThingsResponse(ThingsResponses.SEARCH_QUERY, {
            title: response.response.title,
          });
    } catch (error) {
      setIsLoading(false);
      console.error("Error in things:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return formatThingsResponse(ThingsResponses.INVALID_REQUEST, {
        error: errorMessage,
      });
    }
  };

  const processMessage = async (
    userMessage: string,
    context?: string,
  ): Promise<void> => {
    onResponse({
      message: `You: ${userMessage}`,
      timestamp: new Date().toISOString(),
      prefix: "th",
      isError: false,
    });

    const response = await exportThingsLink(userMessage, context);

    if (response) {
      onResponse({
        message: response,
        prefix: "th",
        timestamp: new Date().toISOString(),
        isError: false,
      });
    }
  };

  return { processMessage };
}
