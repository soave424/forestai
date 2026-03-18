import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface RegisterFormProps {
  onSubmit: (data: { author: string; name: string; source: string; description: string }) => void;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ author: "", name: "", source: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author || !form.name || !form.description) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }
    onSubmit(form);
    setForm({ author: "", name: "", source: "", description: "" });
    setOpen(false);
    toast.success("지식이 창고에 저장되었습니다.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all">
          <Plus className="w-4 h-4 mr-1" />
          지식 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>✍️ 지식 등록하기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: "기록자", key: "author" as const, placeholder: "이름" },
            { label: "곤충 이름", key: "name" as const, placeholder: "학명 포함 권장" },
            { label: "관찰 출처", key: "source" as const, placeholder: "현장, 논문 등" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">상세 지식</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="관찰 내용을 자세히 기록하세요"
              rows={3}
              className="w-full bg-input rounded-md px-3 py-2 text-sm text-foreground shadow-input outline-none focus:ring-2 focus:ring-ring/20 transition-all resize-none"
            />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95">
            공용 창고에 저장
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
