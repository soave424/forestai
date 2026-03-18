import { useState } from "react";
import { Link } from "react-router-dom";
import { KnowledgeCard } from "@/components/KnowledgeCard";
import { RegisterForm } from "@/components/RegisterForm";
import { ChatView } from "@/components/ChatView";
import { useInsectStore } from "@/hooks/useInsectStore";
import { BookOpen, MessageCircle, Leaf, Sparkles, ClipboardList } from "lucide-react";

type Tab = "warehouse" | "chat";

const Index = () => {
  const [tab, setTab] = useState<Tab>("warehouse");
  const { insects, addInsect, selectedIds, toggleSelection, clearSelection, selectedInsects } =
    useInsectStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground tracking-tight">
              숲속 곤충 도서관
            </span>
          </div>
          <div className="flex">
            {[
              { id: "warehouse" as Tab, label: "지식 창고", icon: BookOpen },
              { id: "chat" as Tab, label: "탐험가 채팅", icon: MessageCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 text-sm font-semibold flex items-center gap-1.5 border-b-[3px] transition-colors ${
                  tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === "chat" && selectedInsects.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {selectedInsects.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      {tab === "warehouse" ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              곤충 지식 창고
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed prose-limit">
              관찰 기록이 모여 생태 지도가 됩니다. 카드를 선택한 뒤 탐험가 채팅에서 AI와 함께 탐구하세요.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Grid */}
            <div className="flex-1">
              {selectedInsects.length > 0 && (
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    <strong className="text-primary font-tabular">{selectedInsects.length}</strong>개 선택됨
                  </span>
                  <button
                    onClick={() => setTab("chat")}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    선택 지식으로 AI 분석
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    선택 해제
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {insects.map((insect) => (
                  <KnowledgeCard
                    key={insect.id}
                    insect={insect}
                    selected={selectedIds.has(insect.id)}
                    onToggle={() => toggleSelection(insect.id)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <RegisterForm onSubmit={addInsect} />
            </div>
          </div>
        </div>
      ) : (
        <ChatView selectedInsects={selectedInsects} onClearSelection={clearSelection} />
      )}
    </div>
  );
};

export default Index;
