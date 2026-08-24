import { Link, useParams } from "react-router";
import { getNotes, useFetch } from "./api";

export function NoteView() {
  const { id } = useParams();

  const [data] = useFetch(getNotes(id));

  if (data) {
    const {
      relationships: { backLinks, forwardLinks },
    } = data;

    return (
      <div className="flex justify-center">
        <div className="w-128 ">
          <h1>{data.title}</h1>
          <div>content: {data.content}</div>
          <div>author: {data.owner ?? "none"}</div>
          <div className="relationship-section mt-10 pt-3 border-t-2 border-indigo-200">
            <h2>relationships</h2>
            <h3>backlinks</h3>
            <div>
              {backLinks?.map((d) => (
                <div className="flex flex-row gap-3">
                  <p>{d.title}</p>
                  <Link to={`/notes/${d.id}`}>
                    <p className="text-teal-100 underline dark:text-till text-sm">
                      View Note
                    </p>
                  </Link>
                </div>
              ))}
            </div>
            <h3>linked to</h3>
            <div>
              {forwardLinks?.map((d) => (
                <div className="flex flex-row gap-3">
                  <p>{d.title}</p>
                  <Link to={`/notes/${d.id}`}>
                    <p className="text-teal-100 underline dark:text-till text-sm">
                      View Note
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function NoteCard({ data: d }) {
  return (
    <div key={d.id} className="w-64 border-4 border-teal-300 pb-6">
      <h1 className="bg-primary text-white p-4 rounded-lg">{d.title}</h1>
      <div>content: {d.content}</div>
      <div>author: {d.owner ?? "none"}</div>
      <Link to={`/notes/${d.id}`}>
        <p className="text-teal-100 underline dark:text-till text-sm">
          View Note
        </p>
      </Link>
    </div>
  );
}
export function NoteList() {
  const [data] = useFetch(getNotes());

  if (data) {
    return (
      <div className="flex flex-wrap items-center gap-6 p-7">
        {data.map((d) => (
          <NoteCard data={d} />
        ))}
      </div>
    );
  }
}
