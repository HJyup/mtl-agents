"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useCalendarMode from "@/hooks/use-calendar-agent";
import useChatMode from "@/hooks/use-chat-agent";
import { ChatInput } from "@/components/modules/chat-input";
import { ChatDisplay } from "@/components/modules/chat-display";
import AuthError from "@/components/modules/auth-error";
import Loader from "@/components/ui/loader";
import { AGENTS } from "@/const/agents";

export interface MessageResponse {
  message: string;
  timestamp: string;
  isError: boolean;
  prefix?: string;
}

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [responses, setResponses] = useState<MessageResponse[]>([]);
  const [prefixValue, setPrefixValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  console.log(responses);

  const calendarMode = useCalendarMode({
    onResponse: (response: MessageResponse) =>
      setResponses((prev) => [...prev, response]),
    setIsLoading,
  });

  const chatMode = useChatMode({
    onResponse: (response: MessageResponse) =>
      setResponses((prev) => [...prev, response]),
    setIsLoading,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated") {
      setAuthError(null);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (authError) {
    return <AuthError authError={authError} />;
  }

  const handleSendMessage = async (message: string) => {
    if (prefixValue === "cl") {
      await calendarMode.processMessage(
        message,
        responses[responses.length - 1]?.message,
      );
    } else {
      await chatMode.processMessage(message);
    }
  };

  return (
    <div className="flex items-center">
      <aside className="h-screen w-1/6 border-zinc-100 p-6 pt-52 dark:border-zinc-800/40">
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-500">
            Available Agents
          </h3>
          {AGENTS.map((agent) => (
            <p
              key={agent.prefix}
              className="hover:text-primary w-full rounded-md px-1 py-2 text-left text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300"
            >
              {agent.name}{" "}
              <span className="text-xs text-zinc-500 dark:text-zinc-600">
                {agent.prefix}
              </span>
            </p>
          ))}
        </div>
      </aside>
      <div className="w-5/6">
        <div className="flex h-screen flex-col items-center justify-between p-10">
          <div className="relative mt-10 mb-4 w-full flex-1 overflow-y-auto px-5">
            <ChatDisplay responses={responses} />
          </div>

          <ChatInput
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            prefixValue={prefixValue}
            setPrefixValue={setPrefixValue}
          />
        </div>
      </div>
    </div>
  );
}
