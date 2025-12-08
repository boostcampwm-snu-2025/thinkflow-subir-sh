import { createBrowserRouter } from "react-router-dom";
import { PostPage } from "./features/items/pages/PostPage";
import { TaskPage } from "./features/tasks/pages/TaskPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PostPage />,
    errorElement: <div>에러 발생</div>,
  },
  {
    path: "/tasks",
    element: <TaskPage />,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
]);