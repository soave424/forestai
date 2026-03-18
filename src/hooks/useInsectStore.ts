import { useState } from "react";
import { InsectKnowledge } from "@/types/insect";
import { SAMPLE_DATA } from "@/data/sampleInsects";

export function useInsectStore() {
  const [insects, setInsects] = useState<InsectKnowledge[]>(SAMPLE_DATA);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const addInsect = (insect: Omit<InsectKnowledge, "id" | "createdAt">) => {
    const newInsect: InsectKnowledge = {
      ...insect,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setInsects((prev) => [newInsect, ...prev]);
    return newInsect;
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedInsects = insects.filter((i) => selectedIds.has(i.id));

  return { insects, addInsect, selectedIds, toggleSelection, clearSelection, selectedInsects };
}
