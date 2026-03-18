import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/insect";
import { InsectKnowledge } from "@/types/insect";
import { SUGGESTION_QUESTIONS } from "@/data/sampleInsects";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, RotateCcw, Database, Lightbulb, Trash2 } from "lucide-react";

interface ChatViewProps {
  selectedInsects: InsectKnowledge[];
  onClearSelection: () => void;
}

export function ChatView({ selectedInsects, onClearSelection }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "안녕하세요! 🧭 **숲속 탐험가**입니다.\n\n곤충에 대해 궁금한 것을 물어보세요. 지식 창고에서 데이터를 선택하면 더 정밀한 분석이 가능합니다.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    if (selectedInsects.length === 0) return "";
    const ctx = selectedInsects
      .map(
        (i) =>
          `[${i.name}] 기록자: ${i.author}, 출처: ${i.source}\n내용: ${i.description}`
      )
      .join("\n\n");
    return `\n\n---\n📂 연동 데이터:\n${ctx}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call when backend is connected)
    const contextInfo = buildContext();
    const systemPrompt = `당신은 '숲속 탐험가'라는 이름의 곤충 생태 전문 AI입니다. 한국어로 답변하며 학술적이지만 친절한 톤을 유지합니다. 답변 끝에 관련 후속 질문 2-3개를 제안해주세요.${contextInfo}`;

    // Mock streaming response
    setTimeout(() => {
      const mockResponse = generateMockResponse(text, selectedInsects);
      let accumulated = "";
      const words = mockResponse.split("");
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          accumulated += words[i];
          setMessages([...allMessages, { role: "assistant", content: accumulated }]);
          i++;
        } else {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 15);
    }, 500);
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "대화가 초기화되었습니다. 새로운 탐구를 시작해보세요! 🧭",
      },
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                🧭
              </div>
              <div>
                <p className="font-bold text-foreground">숲속 탐험가</p>
                <p className="text-xs text-muted-foreground">Gemini AI Explorer</p>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              대화 초기화
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-[12px_12px_2px_12px] shadow-[0_4px_12px_rgba(5,150,105,0.2)]"
                      : "bg-card text-card-foreground rounded-[12px_12px_12px_2px] shadow-card"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate max-w-none [&_p]:mb-2 [&_strong]:text-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card rounded-lg shadow-card px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-6 py-2 flex flex-wrap gap-2">
          {SUGGESTION_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-semibold rounded-full border border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 bg-card/80 backdrop-blur-md border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="곤충에 대해 궁금한 것을 물어보세요..."
              className="flex-1 bg-input rounded-lg px-4 py-2.5 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 hover:bg-primary/90 disabled:opacity-40 active:scale-95 transition-all flex items-center gap-1 text-sm font-semibold"
            >
              <Send className="w-4 h-4" />
              전송
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-72 border-l border-border bg-card/50 p-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
            <Database className="w-4 h-4 text-primary" />
            연동 데이터
          </h4>
          {selectedInsects.length > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              비우기
            </button>
          )}
        </div>
        {selectedInsects.length === 0 ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            지식 창고에서 곤충 카드를 선택하면 여기에 표시되고 AI 대화에 반영됩니다.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedInsects.map((ins) => (
              <div
                key={ins.id}
                className="bg-primary/5 rounded-md p-2.5 text-xs border border-primary/10"
              >
                <p className="font-bold text-foreground mb-0.5">{ins.name}</p>
                <p className="text-muted-foreground line-clamp-2">{ins.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1 mb-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            탐구 팁
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>✔️ AI 답변 끝의 추천 질문을 클릭해 탐구를 심화하세요.</p>
            <p>✔️ 여러 곤충을 동시에 선택하면 비교 분석이 가능합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockResponse(question: string, selected: InsectKnowledge[]): string {
  const hasContext = selected.length > 0;
  const names = selected.map((s) => s.name).join(", ");

  if (hasContext) {
    return `## 분석 결과\n\n${names}에 대한 질문을 분석했습니다.\n\n${selected
      .map(
        (s) =>
          `**${s.name}**\n${s.description}\n- 기록자: ${s.author}\n- 출처: ${s.source}`
      )
      .join(
        "\n\n"
      )}\n\n### 생태적 의의\n이 곤충들은 각각 독특한 생태적 니치를 차지하며, 생태계 균형에 중요한 역할을 합니다.\n\n---\n💡 **추천 질문:**\n- "${names}의 천적 관계는 어떻게 되나요?"\n- "이 종들의 계절별 활동 패턴은?"\n- "서식지 보전을 위한 방안은?"`;
  }

  return `좋은 질문입니다! "${question}"에 대해 답변드리겠습니다.\n\n곤충은 지구 생태계에서 가장 다양하고 중요한 생물군 중 하나입니다. 현재까지 약 **100만 종** 이상이 기록되어 있으며, 실제로는 그 수가 훨씬 많을 것으로 추정됩니다.\n\n### 핵심 포인트\n1. **수분 매개**: 꽃가루 전파를 통한 식물 번식 지원\n2. **먹이 사슬**: 조류, 양서류 등의 핵심 먹이원\n3. **분해 작용**: 유기물 순환에 필수적 역할\n\n---\n💡 **추천 질문:**\n- "특정 곤충의 생태적 역할이 궁금해요"\n- "곤충 개체수 감소의 원인은?"\n- "도시 환경에서의 곤충 다양성은?"`;
}
