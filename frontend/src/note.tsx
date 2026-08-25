import {
  useState,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from "react";
import { Link, useParams } from "react-router";
import { apiBase } from "./apiRequests";
import { useFetch } from "./hooks/use-fetch";
import type { EditorProps, NoteData } from "./types";
import { NoteEditor } from "./editor";

function LinkView({
  text,
  children,
}: {
  text?: string;
  children?: ReactElement;
}) {
  return (
    <p className="text-teal-100 underline dark:text-till text-sm">
      {text ?? children}
    </p>
  );
}

function NoteView({
  data,
  setEditing,
}: {
  data: NoteData;
  setEditing: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    relationships: { backLinks, forwardLinks },
  } = data;

  return (
    <div className="flex justify-center">
      <div className="w-128">
        <h1>{data.title}</h1>
        <div>content: {data.content}</div>
        <div>author: {data.owner ?? "none"}</div>
        <LinkView>
          <a
            onClick={() => {
              setEditing(true);
            }}
          >
            Edit
          </a>
        </LinkView>

        <div className="relationship-section mt-10 pt-3 border-t-2 border-indigo-200">
          <h2>relationships</h2>
          <h3>backlinks</h3>
          <div>
            {backLinks?.map((d) => (
              <div className="flex flex-row gap-3">
                <p>{d.title}</p>
                <Link to={`/notes/${d.id}`}>
                  <LinkView text="view more" />
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
                  <LinkView text="view note" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotePage() {
  const { id } = useParams();
  const [editing, setEditing] = useState(false);
  const { data, loading } = useFetch(`${apiBase}/notes/${id}`, {
    immediate: true,
  });

  if (loading) {
    <Loading />;
  }

  if (data) {
    return editing ? (
      <NoteEditor data={data} setEditing={setEditing} />
    ) : (
      <NoteView data={data} setEditing={setEditing} />
    );
  }
}

function Loading() {
  return (
    <div className="flex justify-center">
      <div className="w-128">LOADING</div>
    </div>
  );
}

function NoteCard({ data }: { data: NoteData }) {
  return (
    <div className="w-64 border-4 border-teal-300 pb-6">
      <h1 className="bg-primary text-white p-4 rounded-lg">{data.title}</h1>
      <div>content: {data.content}</div>
      <div>author: {data.owner ?? "none"}</div>
      <Link to={`/notes/${data.id}`}>
        <LinkView text="view note" />
      </Link>
    </div>
  );
}
export function NoteList() {
  const { data, loading } = useFetch(`${apiBase}/notes`, {
    immediate: true,
  });

  console.log("data", data);
  if (loading) {
    return <Loading />;
  }

  if (data) {
    return (
      <div className="flex flex-wrap items-center gap-6 p-7">
        {data.map((d: NoteData) => (
          <div key={d.id}>
            <NoteCard data={d} />
          </div>
        ))}
      </div>
    );
  }
}
