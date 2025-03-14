"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const GMAIL_CLASS =
  "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-red-500 before:via-blue-500 before:via-yellow-500 before:to-green-500 before:blur-sm before:-z-10";

const CALENDAR_CLASS =
  "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-yellow-500 before:to-green-500 before:blur-sm before:-z-10";

export default function Home() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<
    {
      message: string;
      timestamp: string;
    }[]
  >([]);
  const [prefixValue, setPrefixValue] = useState("");

  useEffect(
    () => {
      if (message.trim().toLowerCase().startsWith("gm")) {
        setPrefixValue("Google Mail");
      }

      if (message.trim().toLowerCase().startsWith("cl")) {
        setPrefixValue("Google Calendar");
      }

      if (message.length === 0) {
        setPrefixValue("");
      }
    },
    [message]
  );

  const handleSubmit = () => {
    if (!message) return;
    const mockResponse = `Based on your request, I've found that the best time for scheduling a meeting with you is ${new Date().toLocaleDateString()}.`;
    setResponses([
      ...responses,
      { message: mockResponse, timestamp: new Date().toISOString() }
    ]);
    setMessage("");
  };

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

  return (
    <div className="flex flex-col items-center justify-between h-screen p-10">
      <div className="relative w-3/4 flex-1 overflow-y-auto mb-4 mt-10">
        {responses.length > 0
          ? <AnimatePresence mode="wait">
              {responses.map((response, index) =>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-base leading-relaxed mb-6"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(response.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </span>
                  </div>
                  {response.message}
                </motion.div>
              )}
            </AnimatePresence>
          : <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
              <div className="text-center">
                <p className="text-2xl font-light text-zinc-900 dark:text-zinc-50 mb-2">
                  <span className="font-semibold">MLT</span>-Search
                  <span className="text-xs ml-2 text-zinc-400 dark:text-zinc-500">
                    0.0.1alpha
                  </span>
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 opacity-80">
                  Ask me anything, Dan. I know you&apos;re out there and I know
                  everything about you.
                </p>
              </div>
            </div>}
      </div>

      <div
        className={
          "w-3/4 flex gap-3 rounded-2xl border bg-background p-4 shadow-md flex-col " +
          (prefixValue === "Google Mail"
            ? GMAIL_CLASS
            : prefixValue === "Google Calendar" ? CALENDAR_CLASS : "")
        }
      >
        <Textarea
          placeholder="Dan, what do you want from me today?"
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
                {prefixValue}
                <X className="size-3" />
              </Button>}
          </div>
          <Button
            size="icon"
            className="rounded-full self-end"
            onClick={handleSubmit}
          >
            <ChevronUp className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
