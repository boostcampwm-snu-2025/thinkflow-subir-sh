import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows,
} from "lucide-react";
import type { Item, Priority, TaskStatus } from "../../../shared/types";

type CalendarMode = "week" | "month";

type TaskHoverState = {
  task: Item;
  x: number;
  y: number;
} | null;

type DayListState = {
  dateKey: string; // YYYY-MM-DD
  date: Date;
  tasks: Item[];
  x: number;
  y: number;
} | null;

interface TaskCalendarProps {
  tasks: Item[];
  onClickTask: (taskId: number) => void;
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Monday-start week (월~일)
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Mon=0 ... Sun=6
  x.setDate(x.getDate() - day);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatMonthLabel(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatWeekRangeLabel(anchor: Date) {
  const s = startOfWeek(anchor);
  const e = addDays(s, 6);
  const fmt = (x: Date) =>
    `${String(x.getMonth() + 1).padStart(2, "0")}.${String(x.getDate()).padStart(2, "0")}`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}

function statusOf(t: Item): TaskStatus {
  return (t.taskDetail?.status ?? "READY") as TaskStatus;
}

function priorityRank(p?: Priority | null) {
  if (p === "HIGH") return 0;
  if (p === "MEDIUM") return 1;
  if (p === "LOW") return 2;
  return 3;
}

function chipClass(priority: Priority | null | undefined, status: TaskStatus) {
  return clsx(
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
    "border border-transparent",
    "max-w-full",
    status === "DONE" && "opacity-50 line-through",
    priority === "HIGH" && "bg-red-100 text-red-800",
    priority === "MEDIUM" && "bg-amber-100 text-amber-800",
    priority === "LOW" && "bg-emerald-100 text-emerald-800",
    !priority && "bg-slate-100 text-slate-700",
  );
}

function priorityLabel(p?: Priority | null) {
  if (p === "HIGH") return "높음";
  if (p === "MEDIUM") return "중간";
  if (p === "LOW") return "낮음";
  return "-";
}

function clampFixedPosition(x: number, y: number, w: number, h: number) {
  const pad = 10;
  const maxX = Math.max(pad, window.innerWidth - w - pad);
  const maxY = Math.max(pad, window.innerHeight - h - pad);

  return {
    left: Math.min(maxX, Math.max(pad, x + 12)),
    top: Math.min(maxY, Math.max(pad, y + 12)),
  };
}

function CountBadge({
  count,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: {
  count: number;
  onMouseEnter: React.MouseEventHandler<HTMLButtonElement>;
  onMouseMove: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      title="태스크 목록 보기"
    >
      {count}개
    </button>
  );
}

export function TaskCalendar({ tasks, onClickTask }: TaskCalendarProps) {
  const [mode, setMode] = useState<CalendarMode>("week");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));

  // task detail tooltip (title/content/priority)
  const [taskHover, setTaskHover] = useState<TaskHoverState>(null);

  // day list popover ([n개] hover)
  const [dayList, setDayList] = useState<DayListState>(null);
  const [dayListHovering, setDayListHovering] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Item[]>();

    for (const t of tasks) {
      const due = t.taskDetail?.dueDate;
      if (!due) continue;
      const key = due.slice(0, 10); // YYYY-MM-DD
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        const p =
          priorityRank(a.taskDetail?.priority) -
          priorityRank(b.taskDetail?.priority);
        if (p !== 0) return p;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      map.set(k, arr);
    }

    return map;
  }, [tasks]);

  const hasAnyDue = tasksByDate.size > 0;

  const headerLabel =
    mode === "month" ? formatMonthLabel(cursor) : formatWeekRangeLabel(cursor);

  const visibleDays = useMemo(() => {
    if (mode === "week") {
      const s = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => addDays(s, i));
    }

    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [cursor, mode]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleCloseDayList = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      if (!dayListHovering) setDayList(null);
    }, 80);
  };

  const openDayList = (date: Date, x: number, y: number) => {
    const key = toYmd(date);
    const list = tasksByDate.get(key);
    if (!list || list.length === 0) return;

    clearCloseTimer();
    setDayList({
      dateKey: key,
      date,
      tasks: list,
      x,
      y,
    });
  };

  const moveDayList = (x: number, y: number) => {
    setDayList((prev) => (prev ? { ...prev, x, y } : prev));
  };

  const goPrev = () => {
    setTaskHover(null);
    setDayList(null);
    setCursor((d) => (mode === "month" ? addMonths(d, -1) : addDays(d, -7)));
  };

  const goNext = () => {
    setTaskHover(null);
    setDayList(null);
    setCursor((d) => (mode === "month" ? addMonths(d, 1) : addDays(d, 7)));
  };

  const goToday = () => {
    setTaskHover(null);
    setDayList(null);
    setCursor(startOfDay(new Date()));
  };

  // week mode: show chips (wrap). overflow -> [+n개] badge shows list
  const MAX_WEEK_CHIPS = 4;

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
            <CalendarDays size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">캘린더</div>
            <div className="text-[11px] text-slate-500">
              기한이 있는 태스크만 표시됩니다.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("week")}
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
              mode === "week"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
            title="주간"
          >
            <Rows size={14} /> 주
          </button>

          <button
            type="button"
            onClick={() => setMode("month")}
            className={clsx(
              "hidden items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold md:inline-flex",
              mode === "month"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
            title="월간 (넓은 화면)"
          >
            <LayoutGrid size={14} /> 월
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-2 py-2">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
          title="이전"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {headerLabel}
          </span>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200"
          >
            오늘
          </button>
        </div>

        <button
          type="button"
          onClick={goNext}
          className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
          title="다음"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!hasAnyDue ? (
        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
          기한이 설정된 태스크가 없어요.
        </div>
      ) : mode === "month" ? (
        // ===== Month grid =====
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[11px] font-semibold text-slate-500"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {visibleDays.map((d) => {
              const key = toYmd(d);
              const dayTasks = tasksByDate.get(key) ?? [];
              const isToday = key === toYmd(new Date());
              const muted = !isSameMonth(d, cursor);

              return (
                <div
                  key={key}
                  className={clsx(
                    "min-h-[84px] rounded-xl border p-2",
                    "border-slate-200 bg-white",
                    muted && "opacity-40",
                    isToday && "border-slate-900",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                        className={clsx(
                        "text-[11px] font-semibold",
                        isToday ? "text-slate-900" : "text-slate-600",
                        )}
                    >
                        {d.getDate()}
                    </span>
                    </div>

                    {/* 본문 영역(원래 칩 자리)에 [n개]를 '요소'처럼 배치 */}
                    <div className="mt-6 flex items-center justify-center">
                    {dayTasks.length > 0 ? (
                        <CountBadge
                        count={dayTasks.length}
                        onMouseEnter={(e) => openDayList(d, e.clientX, e.clientY)}
                        onMouseMove={(e) => moveDayList(e.clientX, e.clientY)}
                        onMouseLeave={scheduleCloseDayList}
                        />
                    ) : (
                        <span className="text-[10px] font-semibold text-slate-300">&nbsp;</span>
                    )}
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ===== Week rows (월~일 per row) =====
        <div className="space-y-2">
          {visibleDays.map((d, idx) => {
            const key = toYmd(d);
            const dayTasks = tasksByDate.get(key) ?? [];
            const isToday = key === toYmd(new Date());

            const shown = dayTasks.slice(0, MAX_WEEK_CHIPS);
            const overflow = Math.max(0, dayTasks.length - shown.length);

            return (
              <div
                key={key}
                className={clsx(
                  "rounded-xl border border-slate-200 bg-white p-2",
                  isToday && "border-slate-900",
                )}
              >
                <div className="flex items-start gap-2">
                  {/* left: weekday + date */}
                  <div className="w-[56px] shrink-0">
                    <div className="text-[11px] font-semibold text-slate-500">
                      {WEEKDAYS[idx]}
                    </div>
                    <div
                      className={clsx(
                        "text-sm font-semibold",
                        isToday ? "text-slate-900" : "text-slate-700",
                      )}
                    >
                      {String(d.getMonth() + 1).padStart(2, "0")}.
                      {String(d.getDate()).padStart(2, "0")}
                    </div>
                  </div>

                  {/* right: tasks */}
                  {dayTasks.length === 0 ? (
                    <div className="pt-1 text-[11px] text-slate-300">
                      (없음)
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-1">
                        {shown.map((t) => {
                          const st = statusOf(t);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              className={chipClass(t.taskDetail?.priority, st)}
                              onClick={() => onClickTask(t.id)}
                              onMouseEnter={(e) =>
                                setTaskHover({
                                  task: t,
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                              }
                              onMouseMove={(e) =>
                                setTaskHover({
                                  task: t,
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                              }
                              onMouseLeave={() => setTaskHover(null)}
                              title={t.title}
                            >
                              <span className="truncate">
                                {t.title || "(제목 없음)"}
                              </span>
                            </button>
                          );
                        })}

                        {overflow > 0 && (
                          <CountBadge
                            count={dayTasks.length}
                            onMouseEnter={(e) =>
                              openDayList(d, e.clientX, e.clientY)
                            }
                            onMouseMove={(e) =>
                              moveDayList(e.clientX, e.clientY)
                            }
                            onMouseLeave={scheduleCloseDayList}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Day list popover (from [n개]) ===== */}
      {dayList && (
        <div
          className="fixed z-40 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
          style={clampFixedPosition(dayList.x, dayList.y, 320, 260)}
          onMouseEnter={() => {
            clearCloseTimer();
            setDayListHovering(true);
          }}
          onMouseLeave={() => {
            setDayListHovering(false);
            setDayList(null);
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              {dayList.dateKey.slice(5, 10)} 태스크
            </div>
            <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {dayList.tasks.length}개
            </div>
          </div>

          <div className="max-h-[200px] space-y-1 overflow-auto pr-1">
            {dayList.tasks.map((t) => {
              const st = statusOf(t);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={clsx(
                    "flex w-full items-start justify-between gap-2 rounded-xl px-2 py-2 text-left",
                    "hover:bg-slate-50",
                  )}
                  onClick={() => onClickTask(t.id)}
                  onMouseEnter={(e) =>
                    setTaskHover({ task: t, x: e.clientX, y: e.clientY })
                  }
                  onMouseMove={(e) =>
                    setTaskHover({ task: t, x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setTaskHover(null)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-slate-900">
                      {t.title || "(제목 없음)"}
                    </div>
                    {t.content ? (
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">
                        {t.content}
                      </div>
                    ) : (
                      <div className="mt-0.5 text-[11px] text-slate-300">
                        (내용 없음)
                      </div>
                    )}
                  </div>

                  <div
                    className={clsx(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      st === "DONE"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {priorityLabel(t.taskDetail?.priority)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Task detail tooltip (follows cursor) ===== */}
      {taskHover && (
        <div
          className="pointer-events-none fixed z-50 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
          style={clampFixedPosition(taskHover.x, taskHover.y, 280, 150)}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {taskHover.task.title || "(제목 없음)"}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                우선순위:{" "}
                <span className="font-semibold text-slate-700">
                  {priorityLabel(taskHover.task.taskDetail?.priority)}
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {taskHover.task.taskDetail?.dueDate
                ? taskHover.task.taskDetail.dueDate.slice(5, 10)
                : "-"}
            </div>
          </div>

          {taskHover.task.content ? (
            <p className="whitespace-pre-line text-[11px] leading-4 text-slate-700">
              {taskHover.task.content.length > 140
                ? `${taskHover.task.content.slice(0, 140)}…`
                : taskHover.task.content}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">(내용 없음)</p>
          )}
        </div>
      )}
    </div>
  );
}
