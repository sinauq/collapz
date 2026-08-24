import { createBrowserRouter } from "react-router";
import NoteView from "./note";
import { Login, CheckUser } from "./login";

const NoteList = () => <h1>Note List</h1>;
const GraphView = () => <h1>Graph View</h1>;
const UserActivities = () => <h1>User Activities</h1>;

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    element: <CheckUser />,
    children: [
      {
        path: "/notes",
        Component: NoteList,
      },
      {
        path: "/notes/:id",
        Component: NoteView,
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
