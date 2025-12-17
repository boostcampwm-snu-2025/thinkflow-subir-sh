export function buildRetrospectPrompt(input: {
  taskId: number;
  title: string;
  content: string | null;
  createdAt: Date;
  dueDate: string;        // YYYY-MM-DD or "없음"
  priority: string;       // "높음/중간/낮음/없음"
  status: string;
  tags: string[];         // ["#tag", ...]
  comments: { at: string; content: string }[]; // asc timeline
}) {
  const commentsBlock =
    input.comments.length === 0
      ? "(없음)"
      : input.comments
          .map((c) => `- ${c.at}: ${c.content}`)
          .join("\n");

  const tagsBlock = input.tags.length ? input.tags.join(" ") : "(없음)";
  const taskContent = (input.content ?? "").trim() || "(내용 없음)";

  return `
너는 태스크의 "회고 작성 보조"다. 
입력 정보가 부족하면 사실을 지어내지 말고, "추정"으로 표시해라.

출력 형식 규칙:
- 출력은 **오직 텍스트**만. JSON/코드펜스(\`\`\`) 금지.
- ~함 체 사용.
- 반드시 아래 템플릿을 채울 것:
  기한: XX. XX. XX. ~ XX. XX. XX., 우선순위: XX
  태그: [태그들]
  ---
  [작업 내용]
  ---
  [회고]
- 각 섹션은 짧은 문장/불릿 위주.
- [작업 내용]에는 요약, 타임라인(comments 기반), 배운 점, 다음 행동을 포함.
- [회고]에는 3~10개의 질문을 bullet로 작성.
- 질문은 사용자가 회고를 구체화하도록 유도(힘들었던 점, 의사결정, 트레이드오프, 검증, 다음 개선 등).

입력 정보:
[Task]
title: ${input.title}
content:
${taskContent}

meta:
- 생성일: ${input.createdAt.toISOString().replace("T", " ").slice(0, 16)}
- 기한: ${input.dueDate}
- 우선순위: ${input.priority}
- 태그: ${tagsBlock}

[Comments Timeline]
${commentsBlock}
`.trim();
}
