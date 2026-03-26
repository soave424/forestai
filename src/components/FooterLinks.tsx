import { useState } from "react";
import { Mail, FileText, Shield } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from
"@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TERMS_OF_SERVICE = `# 운영방침 (이용약관)

**최종 수정일:** 2026년 3월 1일

## 제1조 (목적)
본 약관은 "숲속 곤충 도서관"(이하 "서비스")의 이용과 관련하여 서비스 운영자와 이용자 간의 권리, 의무 및 책임사항을 규정하는 것을 목적으로 합니다.

## 제2조 (서비스의 내용)
서비스는 다음의 기능을 제공합니다:
- 곤충 관련 지식 등록 및 공유 (지식 창고)
- AI 기반 곤충 탐구 채팅 (탐험가 채팅)
- 곤충 관찰 기록 관리 (관찰 기록장)
- 공공 데이터 기반 곤충 도감 검색 (곤충 도감)

## 제3조 (이용자의 의무)
1. 이용자는 서비스를 교육 및 학습 목적으로 사용해야 합니다.
2. 허위 정보를 고의로 등록하거나, 타인의 권리를 침해하는 콘텐츠를 게시하여서는 안 됩니다.
3. 서비스의 정상적인 운영을 방해하는 행위를 하여서는 안 됩니다.

## 제4조 (콘텐츠의 관리)
1. 이용자가 등록한 콘텐츠의 저작권은 해당 이용자에게 있습니다.
2. 운영자는 서비스 운영 목적 범위 내에서 이용자 콘텐츠를 활용할 수 있습니다.
3. 부적절한 콘텐츠는 사전 통지 없이 삭제될 수 있습니다.

## 제5조 (면책사항)
1. AI가 생성한 정보는 참고용이며, 정확성을 보장하지 않습니다.
2. 공공 데이터 API를 통해 제공되는 정보는 해당 데이터 제공 기관의 책임 하에 있습니다.
3. 서비스는 무료로 제공되며, 운영자는 서비스 중단이나 데이터 손실에 대해 책임을 지지 않습니다.

## 제6조 (약관의 변경)
본 약관은 필요 시 변경될 수 있으며, 변경 사항은 서비스 내 공지를 통해 안내됩니다.`;

const PRIVACY_POLICY = `# 개인정보처리방침

**최종 수정일:** 2026년 3월 24일

"숲속 곤충 도서관"(이하 "서비스")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」에 따라 다음과 같이 개인정보처리방침을 수립·공개합니다.

## 제1조 (수집하는 개인정보 항목 및 수집 방법)
서비스는 최소한의 개인정보만을 수집합니다:
- **지식 등록 시:** 기록자 이름 (닉네임 사용 가능)
- **관찰 기록 시:** 기록자 이름, 관찰 위치 (선택사항)
- **자동 수집:** 서비스 이용 기록, 접속 로그, 접속 IP 정보

## 제2조 (개인정보의 수집 및 이용 목적)
수집된 개인정보는 다음 목적으로만 이용됩니다:
- 지식 및 관찰 기록의 작성자 표시
- 서비스 이용 통계 및 개선
- 서비스 안정성 확보 및 부정 이용 방지

## 제3조 (개인정보의 보유 및 이용 기간)
- 이용자가 등록한 정보는 서비스 이용 기간 동안 보유됩니다.
- 이용자의 삭제 요청 시 지체 없이 해당 정보를 파기합니다.
- 관련 법령에 따라 보존이 필요한 경우, 해당 법령에서 정한 기간 동안 보관합니다.

## 제4조 (개인정보의 제3자 제공)
서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다:
- 이용자가 사전에 동의한 경우
- 법령에 의해 요구되는 경우

## 제5조 (개인정보 처리 위탁)
서비스는 현재 개인정보 처리를 외부에 위탁하고 있지 않습니다. 향후 위탁이 발생할 경우, 위탁 업체명과 위탁 업무 내용을 본 방침에 공개하겠습니다.

## 제6조 (개인정보의 안전성 확보 조치)
서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
- 개인정보의 암호화 전송 (SSL/TLS 적용)
- 접근 권한의 최소화 및 관리
- 개인정보 접근 기록의 보관
- 해킹 등에 대비한 보안 시스템 운영

## 제7조 (이용자의 권리 및 행사 방법)
이용자는 언제든지 다음의 권리를 행사할 수 있습니다:
- 개인정보 열람 요구
- 개인정보 정정·삭제 요구
- 개인정보 처리정지 요구
- 위 요청은 아래 개인정보 보호책임자에게 이메일로 연락하시면 지체 없이 처리하겠습니다.

## 제8조 (만 14세 미만 아동의 개인정보 보호)
① 서비스는 만 14세 미만 아동의 개인정보를 수집하는 경우, 법정대리인의 동의를 받습니다.
② 서비스는 법정대리인의 동의 여부를 다음과 같은 방법으로 확인합니다.
- 학교를 통한 서면 동의서 제출
- 전자우편을 통한 동의 의사 확인
- 기타 관련 법령에서 허용하는 방법
③ 법정대리인의 동의 확인을 위하여 필요한 최소한의 정보(성명 등)를 수집할 수 있습니다.
④ 법정대리인의 동의 기록은 관련 법령에 따라 일정 기간 안전하게 보관됩니다.
⑤ 법정대리인은 언제든지 아동의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요청할 수 있으며, 동의를 철회할 수 있습니다.

## 제9조 (개인정보 보호책임자)
개인정보 관련 문의 및 권리 행사는 아래 연락처로 문의해 주세요:
- **개인정보 보호책임자:** 서비스 운영자
- **이메일:** edustg123@gmail.com

## 제10조 (개인정보의 파기)
개인정보의 수집 및 이용 목적이 달성된 경우, 해당 정보를 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제합니다.

## 제11조 (방침의 변경)
본 방침은 법령 및 서비스 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지합니다.`;

export function FooterLinks() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Mail className="w-3.5 h-3.5" />
          문의: edustg123@gmail.com
        </span>
        <span className="text-border">|</span>
        <PolicyDialog title="운영방침" content={TERMS_OF_SERVICE} icon={<FileText className="w-3.5 h-3.5" />} />
        <span className="text-border">|</span>
        <PolicyDialog title="개인정보처리방침" content={PRIVACY_POLICY} icon={<Shield className="w-3.5 h-3.5" />} />
        <span className="text-border">|</span>
        <span>© 2026 숲속 곤충 도서관</span>
      </div>
    </footer>);

}

function PolicyDialog({ title, content, icon }: {title: string;content: string;icon: React.ReactNode;}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
          {icon}
          {title}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            {content.split("\n").map((line, i) => {
              if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-foreground mt-3 mb-1">{line.slice(3)}</h2>;
              if (line.startsWith("- **")) {
                const match = line.match(/- \*\*(.+?)\*\*\s*(.*)$/);
                if (match) return <p key={i} className="text-muted-foreground ml-2 my-0.5"><strong className="text-foreground">{match[1]}</strong> {match[2]}</p>;
              }
              if (line.startsWith("- ")) return <p key={i} className="text-muted-foreground ml-2 my-0.5">• {line.slice(2)}</p>;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-muted-foreground text-xs my-1">{line.replace(/\*\*/g, "")}</p>;
              if (line.match(/^\d+\./)) return <p key={i} className="text-muted-foreground ml-2 my-0.5">{line}</p>;
              if (line.trim() === "") return <div key={i} className="h-1" />;
              return <p key={i} className="text-muted-foreground my-0.5">{line}</p>;
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>);

}