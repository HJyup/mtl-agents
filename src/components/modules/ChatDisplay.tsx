"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageResponse } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { PREFIX_TO_NAME } from "@/const/agents";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FC, memo } from "react";

interface ChatDisplayProps {
  responses: MessageResponse[];
  prefixValue: string;
}

const EmptyStateDisplay = () =>
  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
    <div className="text-center">
      <p className="text-2xl font-light text-zinc-900 dark:text-zinc-50 mb-2">
        <span className="font-semibold">MLT</span>-Agents
        <span className="text-xs ml-2 text-zinc-400 dark:text-zinc-500">
          0.0.1alpha
        </span>
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 opacity-80">
        How can I assist you today?
      </p>
    </div>
  </div>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = memo(({ className, children, ...rest }: any) => {
  const match = /language-(\w+)/.exec(className || "");

  if (!match) {
    return (
      <code
        className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm"
        {...rest}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="rounded-md overflow-hidden my-4">
      <div className="bg-gray-800 text-gray-200 px-4 py-1 text-xs flex justify-between items-center">
        <span>
          {match[1]}
        </span>
      </div>
      <SyntaxHighlighter
        style={vs2015}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0 0 0.375rem 0.375rem"
        }}
        {...rest}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

const markdownComponents = {
  p: ({ children }: { children: React.ReactNode }) =>
    <p className="mb-4">
      {children}
    </p>,
  h1: ({ children }: { children: React.ReactNode }) =>
    <h1 className="text-2xl font-bold mt-6 mb-4">
      {children}
    </h1>,
  h2: ({ children }: { children: React.ReactNode }) =>
    <h2 className="text-xl font-bold mt-5 mb-3">
      {children}
    </h2>,
  h3: ({ children }: { children: React.ReactNode }) =>
    <h3 className="text-lg font-bold mt-4 mb-2">
      {children}
    </h3>,
  ul: ({ children }: { children: React.ReactNode }) =>
    <ul className="list-disc pl-6 mb-4">
      {children}
    </ul>,
  ol: ({ children }: { children: React.ReactNode }) =>
    <ol className="list-decimal pl-6 mb-4">
      {children}
    </ol>,
  li: ({ children }: { children: React.ReactNode }) =>
    <li className="mb-1">
      {children}
    </li>,
  blockquote: ({ children }: { children: React.ReactNode }) =>
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1 my-4 italic">
      {children}
    </blockquote>,
  code: CodeBlock,
  table: ({ children }: { children: React.ReactNode }) =>
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>,
  thead: ({ children }: { children: React.ReactNode }) =>
    <thead className="bg-gray-50 dark:bg-gray-800">
      {children}
    </thead>,
  tbody: ({ children }: { children: React.ReactNode }) =>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>,
  tr: ({ children }: { children: React.ReactNode }) =>
    <tr>
      {children}
    </tr>,
  th: ({ children }: { children: React.ReactNode }) =>
    <th className="px-4 py-2 text-left text-sm font-medium">
      {children}
    </th>,
  td: ({ children }: { children: React.ReactNode }) =>
    <td className="px-4 py-2 text-sm">
      {children}
    </td>,
  a: ({ href, children }: { href?: string; children: React.ReactNode }) =>
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>,
  hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />
};

const MessageItem = memo(
  ({
    response,
    prefixValue,
    index
  }: {
    response: MessageResponse;
    prefixValue: string;
    index: number;
  }) => {
    const isUserMessage = response.message.startsWith("You:");

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`text-base leading-relaxed mb-6 ${response.isError
          ? "text-red-500"
          : ""}`}
      >
        <div className="flex items-center gap-2">
          {prefixValue &&
            !isUserMessage &&
            <span className="text-sm font-medium">
              {PREFIX_TO_NAME[prefixValue as keyof typeof PREFIX_TO_NAME]}:
            </span>}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(response.timestamp).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            })}
          </span>
        </div>
        <div
          className={
            isUserMessage
              ? "text-muted-foreground"
              : "prose prose-sm dark:prose-invert max-w-none"
          }
        >
          {isUserMessage
            ? response.message
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ReactMarkdown components={markdownComponents as any}>
                {response.message}
              </ReactMarkdown>}
        </div>
      </motion.div>
    );
  }
);

MessageItem.displayName = "MessageItem";

export const ChatDisplay: FC<ChatDisplayProps> = ({
  responses,
  prefixValue
}) => {
  if (responses.length === 0) {
    return <EmptyStateDisplay />;
  }

  return (
    <AnimatePresence mode="wait">
      {responses.map((response, index) =>
        <MessageItem
          key={`${response.timestamp}-${index}`}
          response={response}
          prefixValue={prefixValue}
          index={index}
        />
      )}
    </AnimatePresence>
  );
};
