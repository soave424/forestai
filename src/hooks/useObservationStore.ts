import { useState, useCallback } from "react";
import { ObservationRecord } from "@/types/observation";

const SAMPLE_RECORDS: ObservationRecord[] = [
  {
    id: "1",
    observer: "김연구원",
    date: "2024-03-15",
    subject: "장수말벌",
    content: "오전 10시경 참나무 수액 부근에서 장수말벌 2마리 관찰. 수액을 섭취하며 다른 곤충을 경계하는 행동 확인.",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    observer: "박관찰자",
    date: "2024-04-02",
    subject: "호랑나비",
    content: "감귤나무 잎 뒷면에 알을 낳는 모습 관찰. 약 20분간 3곳에 산란함. 날개 손상 없는 건강한 개체.",
    createdAt: "2024-04-02",
  },
  {
    id: "3",
    observer: "이생태학",
    date: "2024-05-10",
    subject: "꿀벌",
    content: "유채꽃밭에서 활발한 수분 활동 확인. 한 개체가 약 30초 간격으로 꽃을 이동하며 꽃가루를 수집.",
    createdAt: "2024-05-10",
  },
];

export function useObservationStore() {
  const [records, setRecords] = useState<ObservationRecord[]>(SAMPLE_RECORDS);
  const [filterSubject, setFilterSubject] = useState<string>("");

  const addRecord = useCallback(
    (data: Omit<ObservationRecord, "id" | "createdAt">) => {
      const newRecord: ObservationRecord = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    },
    []
  );

  const subjects = Array.from(new Set(records.map((r) => r.subject)));

  const filteredRecords = filterSubject
    ? records.filter((r) => r.subject === filterSubject)
    : records;

  const exportAsText = useCallback(() => {
    const target = filterSubject ? filteredRecords : records;
    const text = target
      .map(
        (r) =>
          `[${r.date}] ${r.subject}\n관찰자: ${r.observer}\n${r.content}\n`
      )
      .join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `관찰기록_${filterSubject || "전체"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [records, filteredRecords, filterSubject]);

  return {
    records,
    filteredRecords,
    subjects,
    filterSubject,
    setFilterSubject,
    addRecord,
    exportAsText,
  };
}
