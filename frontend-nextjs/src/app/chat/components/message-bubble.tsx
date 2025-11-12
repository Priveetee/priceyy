"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiFillOpenAI } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { SiAnthropic, SiMeta } from "react-icons/si";
import { TbFish } from "react-icons/tb";

const PROVIDER_ICONS = {
  openai: AiFillOpenAI,
  google: FcGoogle,
  anthropic: SiAnthropic,
  meta: SiMeta,
  mistral: RiRobot2Line,
  fallback: TbFish,
};

const PROVIDER_COLORS = {
  openai: "from-black to-zinc-900",
  google: "from-blue-500 to-red-500",
  anthropic: "from-orange-500 to-amber-600",
  meta: "from-blue-600 to-indigo-600",
  mistral: "from-purple-500 to-pink-600",
  fallback: "from-cyan-500 to-blue-600",
};

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  isFallback?: boolean;
  modelDisplayName?: string;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  provider = "openai",
  isFallback = false,
  modelDisplayName,
}: MessageBubbleProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, language: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`${language} code copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyTable = async (tableContent: string) => {
    await navigator.clipboard.writeText(tableContent);
    toast.success("Table copied to clipboard");
  };

  const providerKey = isFallback
    ? "fallback"
    : (provider as keyof typeof PROVIDER_ICONS);
  const Icon = PROVIDER_ICONS[providerKey] || PROVIDER_ICONS.fallback;
  const gradientColors =
    PROVIDER_COLORS[providerKey] || PROVIDER_COLORS.fallback;

  if (role === "assistant") {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 max-w-3xl">
          {isFallback && modelDisplayName && (
            <div className="text-xs text-cyan-400 mb-1 flex items-center gap-1">
              <TbFish className="h-3 w-3" />
              <span>Using {modelDisplayName}</span>
            </div>
          )}
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const codeString = String(children).replace(/\n$/, "");

                  if (!inline && language) {
                    return (
                      <div className="relative group my-4">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyCode(codeString, language)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded"
                          >
                            {copiedCode === codeString ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1 rounded-t border-b border-zinc-700">
                          {language}
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: "0 0 0.5rem 0.5rem",
                            fontSize: "0.875rem",
                          }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                table({ children, ...props }) {
                  const tableContent = String(children);
                  return (
                    <div className="relative group my-4">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => handleCopyTable(tableContent)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table
                          className="border-collapse w-full text-sm"
                          {...props}
                        >
                          {children}
                        </table>
                      </div>
                    </div>
                  );
                },
                thead({ children, ...props }) {
                  return (
                    <thead className="bg-zinc-800" {...props}>
                      {children}
                    </thead>
                  );
                },
                th({ children, ...props }) {
                  return (
                    <th
                      className="border border-zinc-700 px-4 py-2 text-left font-semibold"
                      {...props}
                    >
                      {children}
                    </th>
                  );
                },
                td({ children, ...props }) {
                  return (
                    <td className="border border-zinc-700 px-4 py-2" {...props}>
                      {children}
                    </td>
                  );
                },
                p({ children, ...props }) {
                  return (
                    <p
                      className="text-zinc-200 mb-3 leading-relaxed"
                      {...props}
                    >
                      {children}
                    </p>
                  );
                },
                ul({ children, ...props }) {
                  return (
                    <ul
                      className="list-disc list-inside text-zinc-200 mb-3 space-y-1"
                      {...props}
                    >
                      {children}
                    </ul>
                  );
                },
                ol({ children, ...props }) {
                  return (
                    <ol
                      className="list-decimal list-inside text-zinc-200 mb-3 space-y-1"
                      {...props}
                    >
                      {children}
                    </ol>
                  );
                },
                h1({ children, ...props }) {
                  return (
                    <h1
                      className="text-2xl font-bold text-white mb-3"
                      {...props}
                    >
                      {children}
                    </h1>
                  );
                },
                h2({ children, ...props }) {
                  return (
                    <h2
                      className="text-xl font-bold text-white mb-2"
                      {...props}
                    >
                      {children}
                    </h2>
                  );
                },
                h3({ children, ...props }) {
                  return (
                    <h3
                      className="text-lg font-bold text-white mb-2"
                      {...props}
                    >
                      {children}
                    </h3>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          <div className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
            <span>{timestamp.toLocaleTimeString()}</span>
            {modelDisplayName && (
              <>
                <span>•</span>
                <span className="text-zinc-600">{modelDisplayName}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-4 justify-end">
      <div className="flex-1 max-w-3xl flex flex-col items-end">
        <div className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-2xl border border-zinc-700">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
