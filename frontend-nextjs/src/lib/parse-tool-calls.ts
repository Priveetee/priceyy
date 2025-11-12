export function parseToolCallsFromContent(content: string): {
  hasToolCalls: boolean;
  toolCalls: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  cleanContent: string;
} {
  const toolCallRegex1 = /\[(\w+)\(([^)]*)\)\]/g;
  const toolCallRegex2 = /\[functions\.(\w+)(?:\([^)]*\))?\]/g;
  const toolCallRegex3 = /\[(\w+)(?:\(\))?\]/g;

  const matches1 = [...content.matchAll(toolCallRegex1)];
  const matches2 = [...content.matchAll(toolCallRegex2)];
  const matches3 =
    matches1.length === 0 && matches2.length === 0
      ? [...content.matchAll(toolCallRegex3)]
      : [];

  if (matches2.length > 0) {
    const toolCalls = matches2.map((match, index) => {
      const functionName = match[1];

      return {
        id: `call_${Date.now()}_${index}`,
        type: "function",
        function: {
          name: functionName,
          arguments: JSON.stringify({}),
        },
      };
    });

    const cleanContent = content.replace(toolCallRegex2, "").trim();

    return {
      hasToolCalls: true,
      toolCalls,
      cleanContent,
    };
  }

  if (matches1.length > 0) {
    const toolCalls = matches1.map((match, index) => {
      const functionName = match[1];
      const argsString = match[2];

      const argsObj: Record<string, any> = {};
      const argRegex = /(\w+)=["']([^"']+)["']/g;
      let argMatch;

      while ((argMatch = argRegex.exec(argsString)) !== null) {
        argsObj[argMatch[1]] = argMatch[2];
      }

      return {
        id: `call_${Date.now()}_${index}`,
        type: "function",
        function: {
          name: functionName,
          arguments: JSON.stringify(argsObj),
        },
      };
    });

    const cleanContent = content.replace(toolCallRegex1, "").trim();

    return {
      hasToolCalls: true,
      toolCalls,
      cleanContent,
    };
  }

  if (matches3.length > 0) {
    const toolCalls = matches3.map((match, index) => {
      const functionName = match[1];

      return {
        id: `call_${Date.now()}_${index}`,
        type: "function",
        function: {
          name: functionName,
          arguments: JSON.stringify({}),
        },
      };
    });

    const cleanContent = content.replace(toolCallRegex3, "").trim();

    return {
      hasToolCalls: true,
      toolCalls,
      cleanContent,
    };
  }

  return {
    hasToolCalls: false,
    toolCalls: [],
    cleanContent: content,
  };
}
