import { createBrowserRouter, redirect } from "react-router";
import { NotePage, NoteList } from "./note";
import { Login, CheckUser } from "./login";
import { NoteEditor } from "./editor";

const GraphView = () => <h1>Graph View</h1>;
const UserActivities = () => <h1>User Activities</h1>;

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    element: <CheckUser />,
    children: [
      {
        path: "/",
        loader: () => redirect("/notes"),
      },
      {
        path: "/notes",
        Component: NoteList,
      },
      {
        path: "/notes/create",
        Component: NoteEditor,
      },
      {
        path: "/notes/:id",
        Component: NotePage,
      },
      {
        path: "/users",
        children: [{ path: ":id", Component: UserActivities }],
      },
      {
        path: "/graph",
        Component: GraphView,
      },
    ],
  },
]);
