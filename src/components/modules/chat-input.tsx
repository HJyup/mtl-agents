"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  STRING_TO_PREFIX,
  AGENT_CLASSES,
  PREFIX_TO_NAME,
} from "@/const/agents";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../ui/loader";
import { Badge } from "../ui/badge";

interface ChatInputProps {
  isLoading: boolean;
  prefixValue: string;
  onSendMessage: (message: string) => void;
  setPrefixValue: (value: string) => void;
}

export function ChatInput({
  isLoading,
  onSendMessage,
  prefixValue,
  setPrefixValue,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message) return;

    onSendMessage(message);
    setMessage("");
  };

  useEffect(() => {
    const prefix = STRING_TO_PREFIX(message);
    if (prefix) {
      setPrefixValue(prefix);
      setMessage(message.slice(prefix.length).trim());
    }
  }, [message, setPrefixValue]);

  const clearPrefix = () => {
    setPrefixValue("");
    setMessage(message.slice(3));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const gradientClass =
    prefixValue && prefixValue in AGENT_CLASSES
      ? AGENT_CLASSES[prefixValue as keyof typeof AGENT_CLASSES]
      : "";

  return (
    <div
      className={`bg-background w-full gap-3 rounded-2xl border p-4 shadow-md ${gradientClass}`}
    >
      <Textarea
        placeholder="How can I help you today?"
        className="flex-1 resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex">
        <div className="flex-1">
          {prefixValue && (
            <Badge
              variant="outline"
              className="hover:bg-muted p-2 px-4 transition-colors"
              onClick={clearPrefix}
            >
              {PREFIX_TO_NAME[prefixValue as keyof typeof PREFIX_TO_NAME]}
            </Badge>
          )}
        </div>
        <Button
          size="icon"
          className={`self-end rounded-full ${isLoading ? "opacity-50" : ""}`}
          onClick={handleSubmit}
          disabled={isLoading || message.length === 0}
        >
          {isLoading ? <Loader /> : <ChevronUp className="size-6" />}
        </Button>
      </div>
    </div>
  );
}
