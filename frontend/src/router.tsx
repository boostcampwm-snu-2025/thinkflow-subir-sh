import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./shared/ui/AppLayout";
import { PostPage } from "./features/items/pages/PostPage";
import { TaskPage } from "./features/tasks/pages/TaskPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <div>에러 발생</div>,
    children: [
      {
        path: "/",
        element: <PostPage />,
      },
      {
        path: "/tasks",
        element: <TaskPage />,
      },
    ],
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
]);