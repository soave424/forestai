import { useState } from "react";
import { KnowledgeCard } from "@/components/KnowledgeCard";
import { RegisterForm } from "@/components/RegisterForm";
import { ChatView } from "@/components/ChatView";
import { useInsectStore } from "@/hooks/useInsectStore";
import { useObservationStore } from "@/hooks/useObservationStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  BookOpen, MessageCircle, Leaf, Sparkles, ClipboardList, Bug, Filter,
  Plus, Download, RotateCcw, User, CalendarDays, FileText,
  Search, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";

type Tab = "warehouse" | "chat" | "observation" | "encyclopedia";

const Index = () => {
  const [tab, setTab] = useState<Tab>("warehouse");
  const [filterQuery, setFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "name">("latest");
  const { insects, addInsect, selectedIds, toggleSelection, clearSelection, selectedInsects } =
    useInsectStore();

  const filteredInsects = insects
    .filter((i) => {
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.author.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "ko");
      return b.createdAt.localeCompare(a.createdAt);
    });

  const tabs = [
    { id: "warehouse" as Tab, label: "지식 창고", icon: BookOpen },
    { id: "chat" as Tab, label: "탐험가 채팅", icon: MessageCircle },
    { id: "observation" as Tab, label: "관찰 기록장", icon: ClipboardList },
    { id: "encyclopedia" as Tab, label: "곤충 도감", icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav - always visible */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground tracking-tight">
              숲속 곤충 도서관
            </span>
          </div>
          <div className="flex">
            {tabs.map(({ id, label, icon: Icon }) => (
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
      {tab === "warehouse" && (
        <WarehouseView
          insects={filteredInsects}
          addInsect={addInsect}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          selectedInsects={selectedInsects}
          clearSelection={clearSelection}
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onGoToChat={() => setTab("chat")}
        />
      )}
      {tab === "chat" && (
        <ChatView selectedInsects={selectedInsects} onClearSelection={clearSelection} />
      )}
      {tab === "observation" && <ObservationView />}
      {tab === "encyclopedia" && <EncyclopediaView />}

      <FooterLinks />
    </div>
  );
};

/* ── Warehouse Tab ── */
function WarehouseView({
  insects, addInsect, selectedIds, toggleSelection, selectedInsects,
  clearSelection, filterQuery, setFilterQuery, sortBy, setSortBy, onGoToChat,
}: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">곤충 지식 창고</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            관찰 기록이 모여 생태 지도가 됩니다. 카드를 선택한 뒤 탐험가 채팅에서 함께 탐구하세요.
          </p>
        </div>
        <RegisterForm onSubmit={addInsect} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <input
            value={filterQuery}
            onChange={(e: any) => setFilterQuery(e.target.value)}
            placeholder="이름 또는 기록자로 검색..."
            className="bg-input rounded-md px-3 py-1.5 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all w-56"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="bg-input rounded-md px-3 py-1.5 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
        >
          <option value="latest">최신순</option>
          <option value="name">이름순</option>
        </select>

        {selectedInsects.length > 0 && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-muted-foreground">
              <strong className="text-primary font-tabular">{selectedInsects.length}</strong>개 선택됨
            </span>
            <button
              onClick={onGoToChat}
              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              탐험가 채팅
            </button>
            <button
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {insects.map((insect: any) => (
          <KnowledgeCard
            key={insect.id}
            insect={insect}
            selected={selectedIds.has(insect.id)}
            onToggle={() => toggleSelection(insect.id)}
          />
        ))}
        {insects.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground text-sm py-12">
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Observation Tab ── */
function ObservationView() {
  const { filteredRecords, subjects, filterSubject, setFilterSubject, addRecord, exportAsText } =
    useObservationStore();

  const [form, setForm] = useState({
    observer: "",
    date: new Date().toISOString().split("T")[0],
    subject: "",
    content: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.observer || !form.subject || !form.content) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }
    addRecord(form);
    setForm({ observer: "", date: new Date().toISOString().split("T")[0], subject: "", content: "" });
    toast.success("관찰 기록이 저장되었습니다.");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Add Record Form */}
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> 관찰 기록 추가
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-caps flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5" /> 관찰자
              </label>
              <input
                value={form.observer}
                onChange={(e) => setForm({ ...form, observer: e.target.value })}
                placeholder="이름"
                className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
            <div>
              <label className="label-caps flex items-center gap-1.5 mb-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> 날짜
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="label-caps flex items-center gap-1.5 mb-1.5">
              <Bug className="w-3.5 h-3.5" /> 관찰 대상
            </label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="곤충 이름"
              className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>
          <div>
            <label className="label-caps flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5" /> 관찰 내용
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="관찰한 내용을 상세히 기록하세요"
              rows={4}
              className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all resize-none"
            />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all">
            기록 저장
          </Button>
        </form>
      </section>

      {/* Filter */}
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" /> 관찰 대상별 기록 보기
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all min-w-[180px]"
          >
            <option value="">-- 대상 선택 --</option>
            {subjects.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setFilterSubject("")} className="flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> 전체 보기
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsText} className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> 텍스트로 저장
          </Button>
        </div>
      </section>

      {/* Records */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">
          {filterSubject ? `"${filterSubject}" 관찰 기록` : "전체 관찰 기록"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredRecords.length}건)</span>
        </h2>
        {filteredRecords.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">기록을 추가하거나 필터를 선택하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record: any) => (
              <div key={record.id} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <Bug className="w-4 h-4 text-primary" /> {record.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{record.observer} · {record.date}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{record.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Encyclopedia Tab ── */
interface InsectItem {
  familyKorNm?: string;
  familyNm?: string;
  genusKorNm?: string;
  genusNm?: string;
  insctGnrlNm?: string;
  insctPilbkNo?: string;
  insctSpecsScnm?: string;
  lastUpdtDtm?: string;
}

interface InsectDetail {
  insctGnrlNm?: string;
  insctSpecsScnm?: string;
  familyKorNm?: string;
  familyNm?: string;
  genusKorNm?: string;
  genusNm?: string;
  [key: string]: any;
}

function EncyclopediaView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InsectItem[]>([]);
  const [selected, setSelected] = useState<InsectItem | null>(null);
  const [detail, setDetail] = useState<InsectDetail | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState("");

  const numOfRows = 10;

  const searchInsects = async (pageNo = 1) => {
    if (!query.trim()) {
      toast.error("검색어를 입력해주세요.");
      return;
    }
    setLoading(true);
    setSelected(null);
    setDetail(null);
    setSimplifiedText("");

    try {
      const { data, error } = await supabase.functions.invoke("insect-search", {
        body: { query: query.trim(), pageNo: String(pageNo), numOfRows: String(numOfRows) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const body = data?.body;
      const items = body?.items?.item;
      const total = Number(body?.totalCount || 0);
      const list: InsectItem[] = !items ? [] : Array.isArray(items) ? items : [items];

      setResults(list);
      setTotalCount(total);
      setPage(pageNo);

      if (list.length === 0) toast.info("검색 결과가 없습니다.");
    } catch (e: any) {
      console.error("Search error:", e);
      toast.error(e?.message || "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (item: InsectItem) => {
    setSelected(item);
    setDetail({
      insctGnrlNm: item.insctGnrlNm,
      insctSpecsScnm: item.insctSpecsScnm,
      familyKorNm: item.familyKorNm,
      familyNm: item.familyNm,
      genusKorNm: item.genusKorNm,
      genusNm: item.genusNm,
    });
    setSimplifiedText("");
    setDetailLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("simplify-text", {
        body: {
          text: `곤충 이름: ${item.insctGnrlNm || ""}\n학명: ${item.insctSpecsScnm || ""}\n과: ${item.familyKorNm || ""} (${item.familyNm || ""})\n속: ${item.genusKorNm || ""} (${item.genusNm || ""})`,
          insectName: item.insctGnrlNm || "",
          mode: "detail",
        },
      });
      if (!error && data?.simplified) setSimplifiedText(data.simplified);
    } catch (e) {
      console.error("AI detail error:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const getDescriptionText = (): string => {
    if (!detail) return "";
    const parts: string[] = [];
    parts.push(`이름: ${detail.insctGnrlNm || "알 수 없음"}`);
    if (detail.insctSpecsScnm) parts.push(`학명: ${detail.insctSpecsScnm}`);
    if (detail.familyKorNm) parts.push(`과: ${detail.familyKorNm} (${detail.familyNm || ""})`);
    if (detail.genusKorNm) parts.push(`속: ${detail.genusKorNm} (${detail.genusNm || ""})`);
    return parts.join("\n") || "정보가 없습니다.";
  };

  const totalPages = Math.ceil(totalCount / numOfRows);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">🦋 쉬운 곤충 도감</h1>
        <p className="text-muted-foreground text-sm">궁금한 곤충의 이름을 검색하고 정보를 확인해보세요.</p>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
        <form onSubmit={(e) => { e.preventDefault(); searchInsects(1); }} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="label-caps block mb-1.5">곤충 국명 또는 학명 입력</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 장수풍뎅이, 호랑나비"
              className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="ml-1">검색</span>
          </Button>
        </form>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> 목록
            {totalCount > 0 && <span className="text-xs font-normal text-muted-foreground">({totalCount}건)</span>}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">곤충을 검색하면 여기에 목록이 표시됩니다.</p>
          ) : (
            <>
              <div className="space-y-1.5 mb-4">
                {results.map((item, i) => (
                  <button
                    key={item.insctPilbkNo || i}
                    onClick={() => fetchDetail(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selected?.insctPilbkNo === item.insctPilbkNo
                        ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="font-medium flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-primary shrink-0" />
                      {item.insctGnrlNm || "이름 없음"}
                    </div>
                    {item.insctSpecsScnm && <div className="text-xs text-muted-foreground italic ml-5">{item.insctSpecsScnm}</div>}
                    {item.familyKorNm && <div className="text-xs text-muted-foreground ml-5">{item.familyKorNm}</div>}
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => searchInsects(page - 1)}>
                    <ChevronLeft className="w-4 h-4" /> 이전
                  </Button>
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => searchInsects(page + 1)}>
                    다음 <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm min-h-[400px]">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-muted-foreground text-sm">왼쪽 목록에서 곤충을 선택하세요.</p>
            </div>
          ) : detailLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">AI가 곤충 정보를 준비하고 있어요... 🐛</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Bug className="w-5 h-5 text-primary" />
                  {detail?.insctGnrlNm || selected.insctGnrlNm || "이름 없음"}
                </h2>
                {(detail?.insctSpecsScnm || selected.insctSpecsScnm) && (
                  <p className="text-sm text-muted-foreground italic mt-1">{detail?.insctSpecsScnm || selected.insctSpecsScnm}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  {(detail?.familyKorNm || selected.familyKorNm) && (
                    <span className="bg-muted px-2 py-0.5 rounded">과: {detail?.familyKorNm || selected.familyKorNm}</span>
                  )}
                  {(detail?.genusKorNm || selected.genusKorNm) && (
                    <span className="bg-muted px-2 py-0.5 rounded">속: {detail?.genusKorNm || selected.genusKorNm}</span>
                  )}
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                {simplifiedText ? (
                  <div className="bg-accent/30 rounded-lg p-5 border border-accent">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> AI 곤충 백과
                    </div>
                    <ReactMarkdown>{simplifiedText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{getDescriptionText()}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Index;
