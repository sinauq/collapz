import { Link, useParams } from "react-router";
import { getNotes, useFetch } from "./api";

export function NoteView() {
  const { id } = useParams();

  const [data] = useFetch(getNotes(id));

  if (data) {
    return (
      <div>
        <h1>{data.title}</h1>
        <div>content: {data.content}</div>
        <div>author: {data.owner ?? "none"}</div>
      </div>
    );
  }
}

export function NoteList() {
  const [data] = useFetch(getNotes());

  if (data) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {data.map((d) => (
          <div key={d.id}>
            <h1>{d.title}</h1>
            <div>content: {d.content}</div>
            <div>author: {d.owner ?? "none"}</div>
            <Link to={`/notes/${d.id}`}>View Note</Link>
          </div>
        ))}
      </div>
    );
  }
}
