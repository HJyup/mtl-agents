"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentPrefix, AGENT_CLASSES, PREFIX_TO_NAME } from "@/const/agents";

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  prefixValue: string;
  setPrefixValue: (value: string) => void;
  currentPrefix: AgentPrefix | "";
  setCurrentPrefix: (prefix: AgentPrefix | "") => void;
}

export function ChatInput({
  isLoading,
  onSendMessage,
  prefixValue,
  setPrefixValue,
  currentPrefix,
  setCurrentPrefix
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message) return;

    onSendMessage(message);
    setMessage("");
  };

  useEffect(
    () => {
      if (message.startsWith("cl ")) {
        setPrefixValue("cl");
        setCurrentPrefix("cl");
        setMessage(message.slice(3));
      }
      if (message.startsWith("gm ")) {
        setPrefixValue("gm");
        setCurrentPrefix("gm");
        setMessage(message.slice(3));
      }
      if (message.startsWith("un ")) {
        setPrefixValue("un");
        setCurrentPrefix("un");
        setMessage(message.slice(3));
      }
      if (message.startsWith("th ")) {
        setPrefixValue("th");
        setCurrentPrefix("th");
        setMessage(message.slice(3));
      }
      if (message.startsWith("nt ")) {
        setPrefixValue("nt");
        setCurrentPrefix("nt");
        setMessage(message.slice(3));
      }
    },
    [message, setCurrentPrefix, setPrefixValue]
  );

  const clearPrefix = () => {
    setPrefixValue("");
    setCurrentPrefix("");
    setMessage(message.slice(currentPrefix.length));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={
        "w-full flex gap-3 rounded-2xl border bg-background p-4 shadow-md flex-col " +
        (currentPrefix && currentPrefix in AGENT_CLASSES
          ? AGENT_CLASSES[currentPrefix as keyof typeof AGENT_CLASSES]
          : "")
      }
    >
      <Textarea
        placeholder="How can I help you today?"
        className="flex-1 resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-2">
        <div className="flex-1">
          {prefixValue &&
            <Button
              size="sm"
              variant="ghost"
              className="rounded-sm flex items-center gap-1 border border-zinc-200 dark:border-zinc-800"
              onClick={clearPrefix}
            >
              {PREFIX_TO_NAME[prefixValue as keyof typeof PREFIX_TO_NAME]}
              <X className="size-3" />
            </Button>}
        </div>
        <Button
          size="icon"
          className={`rounded-full self-end ${isLoading ? "opacity-50" : ""}`}
          onClick={handleSubmit}
          disabled={isLoading || message.length === 0}
        >
          {isLoading
            ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            : <ChevronUp className="size-6" />}
        </Button>
      </div>
    </div>
  );
}
