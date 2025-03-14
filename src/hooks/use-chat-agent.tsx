"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

interface SimpleChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatModeProps {
  onResponse: (response: {
    message: string;
    timestamp: string;
    isError: boolean;
  }) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export default function useChatMode({
  onResponse,
  setIsLoading,
}: ChatModeProps) {
  const chatMutation = api.chat.sendMessage.useMutation();
  const [chatHistory, setChatHistory] = useState<SimpleChatMessage[]>([
    {
      role: "assistant",
      content:
        "You are a helpful assistant. Be concise and friendly in your responses.",
    },
  ]);

  const sendMessageToChatGPT = async (
    message: string,
  ): Promise<string | null> => {
    try {
      setIsLoading(true);

      const updatedHistory: SimpleChatMessage[] = [
        ...chatHistory,
        { role: "user", content: message },
      ];

      setChatHistory(updatedHistory);

      const response = await chatMutation.mutateAsync({
        messages: updatedHistory,
      });

      setIsLoading(false);

      if (!response.success) {
        throw new Error("Failed to get response");
      }

      const assistantMessage =
        response.message?.content ?? "I don't know how to respond to that.";

      const newHistory: SimpleChatMessage[] = [
        ...updatedHistory,
        { role: "assistant", content: assistantMessage },
      ];

      setChatHistory(newHistory);

      return assistantMessage;
    } catch (error) {
      setIsLoading(false);
      console.error("Error in chat:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return `I couldn't process your request. ${errorMessage}`;
    }
  };

  const processMessage = async (userMessage: string): Promise<void> => {
    onResponse({
      message: `You: ${userMessage}`,
      timestamp: new Date().toISOString(),
      isError: false,
    });

    const response = await sendMessageToChatGPT(userMessage);

    if (response) {
      onResponse({
        message: response,
        timestamp: new Date().toISOString(),
        isError: false,
      });
    }
  };

  return { processMessage };
}
