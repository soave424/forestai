import { InsectKnowledge } from "@/types/insect";
import { motion } from "framer-motion";
import { Clock, Check } from "lucide-react";

interface KnowledgeCardProps {
  insect: InsectKnowledge;
  selected: boolean;
  onToggle: () => void;
}

export function KnowledgeCard({ insect, selected, onToggle }: KnowledgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-card p-4 rounded-lg shadow-card transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="label-caps text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Taxonomy
        </span>
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 group-hover:border-primary/50"
          }`}
        >
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
      <h3 className="text-foreground font-bold text-base mb-1 leading-tight">
        {insect.name}
      </h3>
      <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1 font-tabular">
        <Clock className="w-3 h-3" />
        {insect.createdAt} · {insect.author}
      </p>
      <p className="text-secondary-foreground text-sm leading-relaxed line-clamp-2">
        {insect.description}
      </p>
      <p className="text-muted-foreground text-[10px] mt-2">{insect.source}</p>
    </motion.div>
  );
}
