"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const messageVariants = cva("flex flex-col gap-2", {
  variants: {
    from: {
      user: "items-end",
      assistant: "items-start",
      system: "items-center",
    },
  },
});

const MessageContext = React.createContext<{
  from?: "user" | "assistant" | "system";
}>({});

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof messageVariants>
>(({ className, from, ...props }, ref) => (
  <MessageContext.Provider value={{ from: from ?? undefined }}>
    <div
      ref={ref}
      className={cn(messageVariants({ from }), className)}
      {...props}
    />
  </MessageContext.Provider>
));
Message.displayName = "Message";

const useMessage = () => {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a Message");
  }
  return context;
};

const messageContentVariants = cva("flex items-start gap-2", {
  variants: {
    from: {
      user: "flex-row-reverse",
      assistant: "flex-row",
    },
  },
});

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { from } = useMessage();
  return (
    <div
      ref={ref}
      className={cn(
        messageContentVariants({ from: from as "user" | "assistant" }),
        className,
      )}
      {...props}
    />
  );
});
MessageContent.displayName = "MessageContent";

const MessageAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    name?: string;
    src?: string;
  }
>(({ className, name, src, ...props }, ref) => (
  <Avatar ref={ref} className={cn("h-8 w-8", className)} {...props}>
    <AvatarImage src={src} />
    <AvatarFallback>
      {name
        ?.split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")}
    </AvatarFallback>
  </Avatar>
));
MessageAvatar.displayName = "MessageAvatar";
