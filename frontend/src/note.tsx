import {
  useState,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from "react";
import { Link, useParams } from "react-router";
import MdPreview from "@uiw/react-markdown-preview";
import { apiBase } from "./apiRequests";
import { useFetch } from "./hooks/use-fetch";
import type { NoteData } from "./types";
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
    title,
    content,
    owner,
    relationships: { backLinks, forwardLinks },
  } = data;

  // TODO users should go in global client state, and then if the id
  // was not found there, then fetch again
  const { data: author, loading } = useFetch(`${apiBase}/users/${owner}`, {
    immediate: true,
  });

  if (loading) {
    console.log("loading");
    return <Loading />;
  } else if (author) {
    return (
      <div className="flex justify-center">
        <div className="w-128">
          <h1>{title}</h1>
          <MdPreview source={content} />
          <div>author: {author.name}</div>
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

function NoteCard({ data: { title, content, id } }: { data: NoteData }) {
  return (
    <div className="w-64 border-4 border-teal-300 pb-6">
      <h1 className="bg-primary text-white p-4 rounded-lg">{title}</h1>
      <MdPreview source={content} />
      <Link to={`/notes/${id}`}>
        <LinkView text="view note" />
      </Link>
    </div>
  );
}
export function NoteList() {
  const { data, loading } = useFetch(`${apiBase}/notes`, {
    immediate: true,
  });

  if (loading) {
    return <Loading />;
  }

  if (data) {
    return (
      <div className="flex flex-wrap items-center gap-6 p-7">
        <Link to="/notes/create">Create New Note</Link>
        {data.map((d: NoteData) => (
          <div key={d.id}>
            <NoteCard data={d} />
          </div>
        ))}
      </div>
    );
  }
}
