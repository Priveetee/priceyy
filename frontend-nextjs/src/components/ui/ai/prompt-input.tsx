"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PromptInput = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={cn(
        "relative flex flex-col gap-2 rounded-lg border bg-background p-2",
        className,
      )}
      {...props}
    />
  );
});
PromptInput.displayName = "PromptInput";

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<typeof Textarea>
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "min-h-[48px] resize-none border-0 bg-transparent p-2 text-sm shadow-none focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
});
PromptInputTextarea.displayName = "PromptInputTextarea";

const PromptInputToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  );
});
PromptInputToolbar.displayName = "PromptInputToolbar";

const PromptInputTools = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />;
});
PromptInputTools.displayName = "PromptInputTools";

const PromptInputSubmit = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    status?: "ready" | "streaming" | "submitted" | "error";
  }
>(({ className, status, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      size="icon"
      className={cn("h-8 w-8", className)}
      {...props}
    >
      {status === "streaming" || status === "submitted" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  );
});
PromptInputSubmit.displayName = "PromptInputSubmit";

const PromptInputModelSelect = Select;
const PromptInputModelSelectTrigger = SelectTrigger;
const PromptInputModelSelectValue = SelectValue;
const PromptInputModelSelectContent = SelectContent;
const PromptInputModelSelectItem = SelectItem;

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
};
