import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/lib/firebase";

export type ChatTurn = { role: "user" | "model"; content: string };
type ChatbotRequest = {
  query: string;
  legalArea?: string;
  history: ChatTurn[];
};
type ChatbotResult = { response: string };

const callChatbot = httpsCallable<ChatbotRequest, ChatbotResult>(
  functions,
  "chatbot",
);

export const getChatbotResponse = async (
  userMessage: string,
  legalArea?: string,
  history: ChatTurn[] = [],
): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("Sign in to use the legal assistant.");
  }

  try {
    const { data } = await callChatbot({
      query: userMessage.trim(),
      legalArea: legalArea || undefined,
      history,
    });
    const response = data.response?.trim();

    if (!response) {
      throw new Error("The assistant returned an empty response.");
    }

    return response;
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    const code = (error as { code?: string })?.code;
    const messages: Record<string, string> = {
      "functions/unauthenticated": "Sign in to use the legal assistant.",
      "functions/failed-precondition":
        "The AI assistant is not configured yet. Please contact support.",
      "functions/unavailable":
        "The assistant is temporarily unavailable. Please try again shortly.",
      "functions/resource-exhausted":
        "The assistant is busy right now. Please try again shortly.",
    };
    throw new Error(
      messages[code || ""] ||
        "I could not get a response. Please try again or speak with an advocate.",
    );
  }
};
