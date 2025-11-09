"use client";

import * as React from "react";
import StickToBottom from "react-scroll-to-bottom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Conversation = React.forwardRef<
  React.ElementRef<typeof StickToBottom>,
  React.ComponentPropsWithoutRef<typeof StickToBottom>
>(({ className, ...props }, ref) => (
  <StickToBottom
    ref={ref}
    scrollViewClassName="h-full w-full"
    followButtonClassName="hidden"
    className={cn("relative", className)}
    {...props}
  />
));
Conversation.displayName = "Conversation";

const ConversationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-4 px-4 pb-4 pt-2", className)}
    {...props}
  />
));
ConversationContent.displayName = "ConversationContent";

const ConversationScrollButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    size="icon"
    className={cn("absolute bottom-4 right-4 h-8 w-8", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </Button>
));
ConversationScrollButton.displayName = "ConversationScrollButton";

export { Conversation, ConversationContent, ConversationScrollButton };
