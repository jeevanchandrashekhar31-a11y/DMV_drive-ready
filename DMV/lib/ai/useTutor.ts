"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkOllamaHealth, ollamaChat } from "./ollama";
import type { OllamaMessage } from "./ollama";
import type { Question } from "../questions/types";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  isStreaming?: boolean;
}

const SYSTEM_PROMPT = `You are an expert DMV driving instructor named "DriveReady AI".
You help students pass their permit test by explaining traffic laws simply and memorably.
Keep responses under 3 sentences unless the student asks for more detail.
Always end responses with a practical tip or encouragement.
If asked something unrelated to driving, gently redirect to DMV topics.`;

export function useTutor(currentQuestion?: Question) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "ai",
      text: "Hi! I'm your AI driving instructor. Ask me anything about this question or any traffic rule.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const historyRef = useRef<OllamaMessage[]>([]);

  useEffect(() => {
    let cancelled = false;

    checkOllamaHealth().then((online) => {
      if (!cancelled) {
        setIsOnline(online);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: userText,
      };

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: "ai",
        text: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, aiMsg]);
      setIsLoading(true);

      const contextPrefix = currentQuestion
        ? `[Context: Student is practicing question: "${currentQuestion.question}". Correct answer is option ${
            currentQuestion.correctIndex + 1
          }: "${currentQuestion.options[currentQuestion.correctIndex]}".]\n\n`
        : "";

      historyRef.current.push({
        role: "user",
        content: contextPrefix + userText,
      });

      try {
        let fullText = "";

        await ollamaChat(
          [{ role: "system", content: SYSTEM_PROMPT }, ...historyRef.current],
          (chunk) => {
            fullText += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText } : m))
            );
          }
        );

        historyRef.current.push({ role: "assistant", content: fullText });
        setIsOnline(true);

        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
        );
      } catch {
        const errText =
          isOnline === false
            ? "Ollama is not running. Start it with: ollama serve"
            : "Connection error. Make sure Ollama is running locally.";

        setIsOnline(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, text: errText, isStreaming: false } : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentQuestion, isLoading, isOnline]
  );

  const clearChat = useCallback(() => {
    historyRef.current = [];
    setMessages([
      {
        id: "init",
        role: "ai",
        text: "Chat cleared! Ask me anything about driving rules.",
      },
    ]);
  }, []);

  return { messages, sendMessage, isLoading, isOnline, clearChat };
}
