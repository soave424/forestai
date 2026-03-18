export interface InsectKnowledge {
  id: string;
  author: string;
  name: string;
  source: string;
  description: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
