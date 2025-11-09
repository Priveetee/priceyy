"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { CodeBlock, CodeBlockCopyButton } from "@/components/ui/ai/code-block";

export function MarkdownResponse({ children }: { children: string }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table {...props} className="w-full text-left" />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-slate-600 px-2 py-1 align-top font-semibold text-slate-200"
            />
          ),
          td: ({ node, ...props }) => (
            <td
              {...props}
              className="border border-slate-700 px-2 py-1 align-top"
            />
          ),
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");

            return match ? (
              <CodeBlock code={codeContent} language={match[1]}>
                <CodeBlockCopyButton />
              </CodeBlock>
            ) : (
              <code
                className={cn(
                  "rounded bg-slate-700 px-1.5 py-1 font-mono text-xs",
                  className,
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
