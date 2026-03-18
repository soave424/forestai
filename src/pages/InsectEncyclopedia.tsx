import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Search,
  Bug,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface InsectItem {
  spe_kname?: string;
  spe_sname?: string;
  fam_kname?: string;
  ord_kname?: string;
  cont?: string;
  img_url?: string;
  [key: string]: any;
}

const InsectEncyclopedia = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InsectItem[]>([]);
  const [selected, setSelected] = useState<InsectItem | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [easyMode, setEasyMode] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState("");
  const [simplifying, setSimplifying] = useState(false);

  const numOfRows = 10;

  const searchInsects = async (pageNo = 1) => {
    if (!query.trim()) {
      toast.error("검색어를 입력해주세요.");
      return;
    }
    setLoading(true);
    setSelected(null);
    setEasyMode(false);
    setSimplifiedText("");

    try {
      const { data, error } = await supabase.functions.invoke("insect-search", {
        body: { query: query.trim(), pageNo, numOfRows },
      });

      if (error) throw error;

      // Parse response - structure depends on public data API
      const items = data?.response?.body?.items || data?.body?.items || data?.items || [];
      const total = data?.response?.body?.totalCount || data?.body?.totalCount || data?.totalCount || 0;

      setResults(Array.isArray(items) ? items : items?.item ? [].concat(items.item) : []);
      setTotalCount(Number(total));
      setPage(pageNo);

      if ((Array.isArray(items) ? items : []).length === 0 && !items?.item) {
        toast.info("검색 결과가 없습니다.");
      }
    } catch (e: any) {
      console.error("Search error:", e);
      toast.error(e?.message || "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimplify = async (insect: InsectItem) => {
    const text = insect.cont || insect.dsc_cont || "정보가 없습니다.";
    setSimplifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("simplify-text", {
        body: { text, insectName: insect.spe_kname || "" },
      });
      if (error) throw error;
      setSimplifiedText(data.simplified || "변환에 실패했습니다.");
      setEasyMode(true);
    } catch (e: any) {
      console.error("Simplify error:", e);
      toast.error(e?.message || "쉬운 말 변환 중 오류가 발생했습니다.");
    } finally {
      setSimplifying(false);
    }
  };

  const totalPages = Math.ceil(totalCount / numOfRows);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-2xl">🦋</span>
            <span className="font-bold text-lg text-foreground tracking-tight">쉬운 곤충 도감</span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">도서관으로</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">🦋 쉬운 곤충 도감</h1>
          <p className="text-muted-foreground text-sm">
            궁금한 곤충의 이름을 검색하고 정보를 확인해보세요.
          </p>
        </div>

        {/* Search */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchInsects(1);
            }}
            className="flex gap-3"
          >
            <div className="flex-1">
              <label className="label-caps block mb-1.5">곤충 국명 또는 학명 입력</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 장수풍뎅이, Allomyrina"
                className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="self-end bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-1">검색</span>
            </Button>
          </form>
        </div>

        {/* Content: List + Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> 목록
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                곤충을 검색하면 여기에 목록이 표시됩니다.
              </p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {results.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelected(item);
                        setEasyMode(false);
                        setSimplifiedText("");
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selected === item
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="font-medium flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5 text-primary shrink-0" />
                        {item.spe_kname || "이름 없음"}
                      </div>
                      {item.spe_sname && (
                        <div className="text-xs text-muted-foreground italic ml-5">
                          {item.spe_sname}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => searchInsects(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" /> 이전
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => searchInsects(page + 1)}
                    >
                      다음 <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            {!selected ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-muted-foreground text-sm">왼쪽 목록에서 곤충을 선택하세요.</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Bug className="w-5 h-5 text-primary" />
                      {selected.spe_kname || "이름 없음"}
                    </h2>
                    {selected.spe_sname && (
                      <p className="text-sm text-muted-foreground italic mt-1">{selected.spe_sname}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {selected.ord_kname && <span>목: {selected.ord_kname}</span>}
                      {selected.fam_kname && <span>과: {selected.fam_kname}</span>}
                    </div>
                  </div>
                </div>

                {/* Mode toggle */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={!easyMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEasyMode(false)}
                    className="flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> 원문 보기
                  </Button>
                  <Button
                    variant={easyMode ? "default" : "outline"}
                    size="sm"
                    disabled={simplifying}
                    onClick={() => {
                      if (simplifiedText) {
                        setEasyMode(true);
                      } else {
                        handleSimplify(selected);
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    {simplifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    쉬운 말로 보기
                  </Button>
                </div>

                {/* Image */}
                {selected.img_url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border">
                    <img
                      src={selected.img_url}
                      alt={selected.spe_kname || "곤충 이미지"}
                      className="w-full max-h-64 object-contain bg-muted"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                  {easyMode && simplifiedText ? (
                    <div className="bg-accent/30 rounded-lg p-4 border border-accent">
                      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5" /> AI가 쉽게 풀어쓴 설명
                      </div>
                      <ReactMarkdown>{simplifiedText}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{selected.cont || selected.dsc_cont || "상세 정보가 없습니다."}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsectEncyclopedia;
