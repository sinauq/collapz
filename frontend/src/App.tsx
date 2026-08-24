import { createBrowserRouter } from "react-router";

const NoteList = () => <h1>Note List</h1>;
const NoteView = () => <h1>Note View</h1>;
const GraphView = () => <h1>Graph View</h1>;
const UserActivities = () => <h1>User Activities</h1>;
const Login = () => <h1>Login</h1>;

export const router = createBrowserRouter([
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
]);
