type LogLevel = "info" | "success" | "error" | "warning" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  data?: any;
  context?: string;
}

class AILogger {
  private logs: LogEntry[] = [];

  private formatTime(): string {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  }

  private getColor(level: LogLevel): string {
    const colors = {
      info: "color: #0ea5e9; font-weight: bold;",
      success: "color: #10b981; font-weight: bold;",
      error: "color: #ef4444; font-weight: bold;",
      warning: "color: #f59e0b; font-weight: bold;",
      debug: "color: #8b5cf6; font-weight: bold;",
    };
    return colors[level];
  }

  private log(level: LogLevel, action: string, data?: any, context?: string) {
    const time = this.formatTime();
    const entry: LogEntry = { timestamp: time, level, action, data, context };
    this.logs.push(entry);

    const icon = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      debug: "🐛",
    }[level];

    console.log(
      `%c[${time}] ${icon} ${action}`,
      this.getColor(level),
      data ? { data, context } : "",
    );
  }

  info(action: string, data?: any, context?: string) {
    this.log("info", action, data, context);
  }

  success(action: string, data?: any, context?: string) {
    this.log("success", action, data, context);
  }

  error(action: string, data?: any, context?: string) {
    this.log("error", action, data, context);
  }

  warning(action: string, data?: any, context?: string) {
    this.log("warning", action, data, context);
  }

  debug(action: string, data?: any, context?: string) {
    this.log("debug", action, data, context);
  }

  toolCall(toolName: string, input: any) {
    this.log("debug", `🔧 Tool Call: ${toolName}`, input, "TOOL_EXECUTION");
  }

  toolResult(toolName: string, output: any, duration: number) {
    this.log(
      "success",
      `✓ Tool Result: ${toolName} (${duration}ms)`,
      output,
      "TOOL_EXECUTION",
    );
  }

  toolError(toolName: string, error: any) {
    this.log("error", `✗ Tool Error: ${toolName}`, error, "TOOL_EXECUTION");
  }

  messageReceived(role: string, content: string, parts?: any) {
    this.log(
      "info",
      `📨 Message Received (${role})`,
      { content: content.substring(0, 100), parts },
      "MESSAGE",
    );
  }

  messageSent(content: string) {
    this.log(
      "info",
      `📤 Message Sent`,
      { content: content.substring(0, 100) },
      "MESSAGE",
    );
  }

  streamStart() {
    this.log("info", "🔄 Stream Started", undefined, "STREAMING");
  }

  streamChunk(type: string, data: any) {
    this.log("debug", `📦 Stream Chunk: ${type}`, data, "STREAMING");
  }

  streamEnd(duration: number) {
    this.log(
      "success",
      `🏁 Stream Ended (${duration}ms)`,
      undefined,
      "STREAMING",
    );
  }

  cartAction(action: string, item?: any) {
    this.log("info", `🛒 Cart: ${action}`, item, "CART");
  }

  navigation(page: string) {
    this.log("info", `🧭 Navigation to ${page}`, undefined, "NAVIGATION");
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const aiLogger = new AILogger();
