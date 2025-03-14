/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { PREFIX_TO_NAME } from "@/const/agents";
import { type FC, memo } from "react";

export interface MessageResponse {
  message: string;
  timestamp: string;
  isError?: boolean;
  prefix?: string;
}

interface ChatDisplayProps {
  responses: MessageResponse[];
}

interface MarkdownChildrenProps {
  children: React.ReactNode;
}

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

interface LinkProps extends MarkdownChildrenProps {
  href?: string;
}

const EmptyStateDisplay: FC = () => (
  <div className="absolute top-1/3 left-1/2 w-full -translate-x-1/2 -translate-y-1/2">
    <div className="text-center">
      <p className="mb-2 text-2xl font-light text-zinc-900 dark:text-zinc-50">
        <span className="font-semibold">MLT</span>-Agents
        <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
          0.0.1alpha
        </span>
      </p>
      <p className="text-sm text-zinc-500 opacity-80 dark:text-zinc-400">
        How can I assist you today?
      </p>
    </div>
  </div>
);

const CodeBlock: FC<CodeBlockProps> = memo(
  ({ className, children, ...rest }) => {
    const match = /language-(\w+)/.exec(className ?? "");

    if (!match) {
      return (
        <code
          className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800"
          {...rest}
        >
          {children}
        </code>
      );
    }

    const content = Array.isArray(children)
      ? children.join("")
      : typeof children === "string"
        ? children
        : "";

    return (
      <div className="my-4 overflow-hidden rounded-md">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-1 text-xs text-gray-200">
          <span>{match[1]}</span>
        </div>
        <SyntaxHighlighter
          style={vs2015 as any}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0 0 0.375rem 0.375rem",
          }}
          {...rest}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

const markdownComponents = {
  p: ({ children }: MarkdownChildrenProps) => (
    <p className="mb-4">{children}</p>
  ),
  h1: ({ children }: MarkdownChildrenProps) => (
    <h1 className="mt-6 mb-4 text-2xl font-bold">{children}</h1>
  ),
  h2: ({ children }: MarkdownChildrenProps) => (
    <h2 className="mt-5 mb-3 text-xl font-bold">{children}</h2>
  ),
  h3: ({ children }: MarkdownChildrenProps) => (
    <h3 className="mt-4 mb-2 text-lg font-bold">{children}</h3>
  ),
  ul: ({ children }: MarkdownChildrenProps) => (
    <ul className="mb-4 list-disc pl-6">{children}</ul>
  ),
  ol: ({ children }: MarkdownChildrenProps) => (
    <ol className="mb-4 list-decimal pl-6">{children}</ol>
  ),
  li: ({ children }: MarkdownChildrenProps) => (
    <li className="mb-1">{children}</li>
  ),
  blockquote: ({ children }: MarkdownChildrenProps) => (
    <blockquote className="my-4 border-l-4 border-gray-300 py-1 pl-4 italic dark:border-gray-700">
      {children}
    </blockquote>
  ),
  code: CodeBlock,
  table: ({ children }: MarkdownChildrenProps) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: MarkdownChildrenProps) => (
    <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
  ),
  tbody: ({ children }: MarkdownChildrenProps) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  ),
  tr: ({ children }: MarkdownChildrenProps) => <tr>{children}</tr>,
  th: ({ children }: MarkdownChildrenProps) => (
    <th className="px-4 py-2 text-left text-sm font-medium">{children}</th>
  ),
  td: ({ children }: MarkdownChildrenProps) => (
    <td className="px-4 py-2 text-sm">{children}</td>
  ),
  a: ({ href, children }: LinkProps) => (
    <a
      href={href}
      className="text-blue-600 hover:underline dark:text-blue-400"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
};

interface MessageItemProps {
  response: MessageResponse;
  index: number;
}

const MessageItem: FC<MessageItemProps> = memo(({ response, index }) => {
  const isUserMessage = response.message.startsWith("You:");
  const formattedTime = new Date(response.timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`mb-6 text-base leading-relaxed ${
        response.isError ? "text-red-500" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {response.prefix && !isUserMessage && (
          <span className="text-sm font-medium">
            {PREFIX_TO_NAME[response.prefix as keyof typeof PREFIX_TO_NAME]}:
          </span>
        )}
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {formattedTime}
        </span>
      </div>
      <div
        className={
          isUserMessage
            ? "text-muted-foreground"
            : "prose prose-sm dark:prose-invert max-w-none"
        }
      >
        {isUserMessage ? (
          response.message
        ) : (
          <ReactMarkdown components={markdownComponents as any}>
            {response.message}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = "MessageItem";

export const ChatDisplay: FC<ChatDisplayProps> = ({ responses }) => {
  if (responses.length === 0) {
    return <EmptyStateDisplay />;
  }

  return (
    <AnimatePresence mode="wait">
      {responses.map((response, index) => (
        <MessageItem
          key={`${response.timestamp}-${index}`}
          response={response}
          index={index}
        />
      ))}
    </AnimatePresence>
  );
};
