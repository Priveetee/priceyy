"use client";

import { LiaLinux } from "react-icons/lia";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AiFillOpenAI } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { SiAnthropic, SiMeta } from "react-icons/si";
import { IconType } from "react-icons";
import { toast } from "sonner";
import { useState } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  provider?: string;
}

const AI_PROVIDER_ICONS: Record<string, IconType> = {
  openai: AiFillOpenAI,
  google: FcGoogle,
  anthropic: SiAnthropic,
  meta: SiMeta,
  mistral: RiRobot2Line,
};

export function MessageBubble({
  role,
  content,
  timestamp,
  provider = "openai",
}: MessageBubbleProps) {
  const isUser = role === "user";
  const AssistantIcon = AI_PROVIDER_ICONS[provider] || RiRobot2Line;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedTable, setCopiedTable] = useState<boolean>(false);

  const handleCopy = (text: string, type: string = "message") => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleCodeCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTableCopy = (tableElement: HTMLTableElement) => {
    const rows = Array.from(tableElement.querySelectorAll("tr"));
    const text = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        return cells.map((cell) => cell.textContent?.trim()).join("\t");
      })
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopiedTable(true);
    toast.success("Table copied to clipboard!");
    setTimeout(() => setCopiedTable(false), 2000);
  };

  return (
    <div
      className={`flex gap-4 py-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <AssistantIcon className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      )}

      <div
        className={`flex flex-col gap-2 max-w-3xl ${isUser ? "items-end" : "items-start"}`}
      >
        {isUser ? (
          <div className="bg-zinc-800 text-white rounded-2xl px-4 py-3 max-w-xl">
            <p className="text-sm">{content}</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    const codeId = `code-${Math.random().toString(36).substring(7)}`;

                    return match ? (
                      <div className="relative group my-4">
                        <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50">
                            <span className="text-xs text-zinc-400 font-mono uppercase">
                              {match[1]}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
                              onClick={() => handleCodeCopy(codeString, codeId)}
                            >
                              {copiedCode === codeId ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: "1rem",
                              background: "transparent",
                              fontSize: "0.875rem",
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ) : (
                      <code
                        className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm"
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  table(props) {
                    const { children, node } = props;
                    return (
                      <div className="my-4 overflow-x-auto relative group">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
                            onClick={(e) => {
                              const table = e.currentTarget
                                .closest(".group")
                                ?.querySelector("table");
                              if (table)
                                handleTableCopy(table as HTMLTableElement);
                            }}
                          >
                            {copiedTable ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <table className="w-full border-collapse bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th(props) {
                    const { children } = props;
                    return (
                      <th className="border border-zinc-700 bg-zinc-800 px-4 py-2 text-left text-sm font-semibold text-zinc-200">
                        {children}
                      </th>
                    );
                  },
                  td(props) {
                    const { children } = props;
                    return (
                      <td className="border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-300"
                onClick={() => handleCopy(content, "Message")}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy message
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <LiaLinux className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      )}
    </div>
  );
}
