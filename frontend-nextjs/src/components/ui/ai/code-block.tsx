"use client";

import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const CodeBlockContext = React.createContext<{ code: string }>({ code: "" });

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, showLineNumbers, className, children, ...props }, ref) => {
    return (
      <CodeBlockContext.Provider value={{ code }}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={language}
            showLineNumbers={showLineNumbers}
            lineNumberStyle={{ minWidth: "2.25em" }}
            className="!m-0 rounded-md"
          >
            {code}
          </SyntaxHighlighter>
          {children}
        </div>
      </CodeBlockContext.Provider>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

const CodeBlockCopyButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & { timeout?: number }
>(({ className, timeout = 2000, ...props }, ref) => {
  const { code } = React.useContext(CodeBlockContext);
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("absolute right-2 top-2 h-7 w-7", className)}
      onClick={onCopy}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
});
CodeBlockCopyButton.displayName = "CodeBlockCopyButton";

export { CodeBlock, CodeBlockCopyButton };
