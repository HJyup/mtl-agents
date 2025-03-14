"use client";

import { useState, useEffect } from "react";
import { AgentPrefix } from "@/const/agents";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageResponse } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ChatDisplay } from "@/components/modules/ChatDisplay";
import { ChatInput } from "@/components/modules/ChatInput";
import useCalendarMode from "@/components/modules/CalendarMode";
import useChatMode from "@/components/modules/ChatMode";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [responses, setResponses] = useState<MessageResponse[]>([]);
  const [prefixValue, setPrefixValue] = useState("");
  const [currentPrefix, setCurrentPrefix] = useState<AgentPrefix | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const calendarMode = useCalendarMode({
    onResponse: response => setResponses(prev => [...prev, response]),
    setIsLoading,
    setAuthError
  });

  const chatMode = useChatMode({
    onResponse: response => setResponses(prev => [...prev, response]),
    setIsLoading
  });

  useEffect(
    () => {
      if (status === "unauthenticated") {
        router.push("/auth/signin");
      }

      if (status === "authenticated") {
        setAuthError(null);
      }
    },
    [status, router]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 p-8 rounded-xl border shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Authentication Error
          </h2>
          <p className="mb-6">
            {authError}
          </p>
          <Button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full"
          >
            Sign out and try again
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (message: string) => {
    if (currentPrefix === "cl") {
      await calendarMode.processMessage(message, responses[responses.length - 1]?.message);
    } else {
      await chatMode.processMessage(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen p-10">
      <div className="relative w-full flex-1 overflow-y-auto mb-4 mt-10 px-5">
        <ChatDisplay responses={responses} prefixValue={prefixValue} />
      </div>

      <ChatInput
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        prefixValue={prefixValue}
        setPrefixValue={setPrefixValue}
        currentPrefix={currentPrefix}
        setCurrentPrefix={setCurrentPrefix}
      />
    </div>
  );
}
