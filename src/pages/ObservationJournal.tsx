import { useState } from "react";
import { useObservationStore } from "@/hooks/useObservationStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ClipboardList,
  Plus,
  Filter,
  Download,
  RotateCcw,
  ArrowLeft,
  User,
  CalendarDays,
  Bug,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const ObservationJournal = () => {
  const {
    filteredRecords,
    subjects,
    filterSubject,
    setFilterSubject,
    addRecord,
    exportAsText,
  } = useObservationStore();

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
    setForm({
      observer: "",
      date: new Date().toISOString().split("T")[0],
      subject: "",
      content: "",
    });
    toast.success("관찰 기록이 저장되었습니다.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <ClipboardList className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground tracking-tight">
              관찰 기록장
            </span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              도서관으로
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Add Record Form */}
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            관찰 기록 추가
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-caps flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  관찰자
                </label>
                <input
                  value={form.observer}
                  onChange={(e) =>
                    setForm({ ...form, observer: e.target.value })
                  }
                  placeholder="이름"
                  className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
                />
              </div>
              <div>
                <label className="label-caps flex items-center gap-1.5 mb-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  날짜
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
                <Bug className="w-3.5 h-3.5" />
                관찰 대상
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
                <FileText className="w-3.5 h-3.5" />
                관찰 내용
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="관찰한 내용을 상세히 기록하세요"
                rows={4}
                className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all resize-none"
              />
            </div>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
            >
              기록 저장
            </Button>
          </form>
        </section>

        {/* Filter Section */}
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            관찰 대상별 기록 보기
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all min-w-[180px]"
            >
              <option value="">-- 대상 선택 --</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterSubject("")}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              전체 보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsText}
              className="flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              텍스트로 저장
            </Button>
          </div>
        </section>

        {/* Records List */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            {filterSubject
              ? `"${filterSubject}" 관찰 기록`
              : "전체 관찰 기록"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredRecords.length}건)
            </span>
          </h2>
          {filteredRecords.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <p className="text-muted-foreground text-sm">
                기록을 추가하거나 필터를 선택하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Bug className="w-4 h-4 text-primary" />
                        {record.subject}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {record.observer} · {record.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {record.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ObservationJournal;
