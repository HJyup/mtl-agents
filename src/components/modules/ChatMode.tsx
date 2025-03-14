"use client";

import { useState } from "react";
import { ChatMessage, MessageResponse } from "@/types/chat";

interface ChatModeProps {
  onResponse: (response: MessageResponse) => void;
  setIsLoading: (isLoading: boolean) => void;
}

// Custom hook to handle chat functionality
export default function useChatMode({
  onResponse,
  setIsLoading
}: ChatModeProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "You are a helpful assistant. Be concise and friendly in your responses."
    }
  ]);

  const sendMessageToChatGPT = async (
    message: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);

      const updatedHistory: ChatMessage[] = [
        ...chatHistory,
        { role: "user", content: message }
      ];

      setChatHistory(updatedHistory);

      // Call our chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: updatedHistory })
      });

      const data = await response.json();
      setIsLoading(false);

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add the assistant's response to history
      const newHistory: ChatMessage[] = [
        ...updatedHistory,
        { role: "assistant", content: data.message.content }
      ];

      setChatHistory(newHistory);

      return data.message.content;
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
      isError: false
    });

    const response = await sendMessageToChatGPT(userMessage);

    if (response) {
      onResponse({
        message: response,
        timestamp: new Date().toISOString(),
        isError: false
      });
    }
  };

  return { processMessage };
}
