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

const InsectEncyclopedia = () => {
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

      if (list.length === 0) {
        toast.info("검색 결과가 없습니다.");
      }
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
      if (!error && data?.simplified) {
        setSimplifiedText(data.simplified);
      }
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
    <div className="min-h-screen bg-background">
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
            onSubmit={(e) => { e.preventDefault(); searchInsects(1); }}
            className="flex gap-3 items-end"
          >
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
              {totalCount > 0 && (
                <span className="text-xs font-normal text-muted-foreground">({totalCount}건)</span>
              )}
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
                      {item.insctSpecsScnm && (
                        <div className="text-xs text-muted-foreground italic ml-5">{item.insctSpecsScnm}</div>
                      )}
                      {item.familyKorNm && (
                        <div className="text-xs text-muted-foreground ml-5">{item.familyKorNm}</div>
                      )}
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
                    <p className="text-sm text-muted-foreground italic mt-1">
                      {detail?.insctSpecsScnm || selected.insctSpecsScnm}
                    </p>
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

                {/* Content */}
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
    </div>
  );
};

export default InsectEncyclopedia;
