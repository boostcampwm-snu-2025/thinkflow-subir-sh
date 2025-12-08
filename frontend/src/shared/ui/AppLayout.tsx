import { Outlet, Link, useLocation } from "react-router-dom";
import { Suspense } from "react";
import clsx from "clsx";

export function AppLayout() {
  const { pathname } = useLocation();
  const isTasks = pathname.startsWith("/tasks");

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* 각 페이지 공통 헤더 */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ThinkFlow</h1>
            <p className="text-sm text-slate-500">
              아이디어부터 태스크까지, 모든 것을 한 곳에서
            </p>
          </div>

          <nav className="flex gap-2 rounded-full bg-slate-200 p-1 text-sm">
            <Link
              to="/tasks"
              className={clsx(
                "rounded-full px-4 py-1",
                isTasks
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-500"
              )}
            >
              Tasks
            </Link>

            <Link
              to="/"
              className={clsx(
                "rounded-full px-4 py-1",
                !isTasks
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-500"
              )}
            >
              Posts & Memos
            </Link>
          </nav>
        </header>

        {/* 페이지 컨텐츠: Suspense로 래핑 */}
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">
              로딩 중...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}