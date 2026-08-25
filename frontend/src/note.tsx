import "@mdxeditor/editor/style.css";
import {
  BoldItalicUnderlineToggles,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import {
  useState,
  type Dispatch,
  type ReactElement,
  type Ref,
  type SetStateAction,
} from "react";
import { Link, useParams } from "react-router";
import { apiBase } from "./apiRequests";
import { useFetch } from "./hooks/use-fetch";
import { typeaheadPlugin } from "@mdxeditor/typeahead-plugin";

type LinkData = {
  title: string;
  id: string;
  relationship: string;
  content: string;
};

type NoteData = {
  title: string;
  id: number;
  relationships: {
    backLinks: Array<LinkData>;
    forwardLinks: Array<LinkData>;
  };
  content: string;
  owner: string;
};

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

interface EditorProps {
  data: NoteData;
  editorRef?: Ref<MDXEditorMethods> | null;
  setEditing: (arg0: boolean) => void;
}

function NoteEditor({ data, editorRef, setEditing }: EditorProps) {
  const [content, setContent] = useState(data.content);

  const { execute, loading } = useFetch();

  const handleSave = async (content: string) => {
    try {
      await execute(`${apiBase}/notes/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
    } finally {
      console.log("finally");
      setEditing(false);
    }
  };

  const toolbarContents = () => (
    <div className="flex flex-column">
      <UndoRedo />
      <BoldItalicUnderlineToggles />
    </div>
  );

  return (
    <div>
      <LinkView>
        <button onClick={() => handleSave(content)} disabled={loading}>
          Save
        </button>
      </LinkView>
      <MDXEditor
        markdown={content}
        ref={editorRef}
        onChange={(v) => setContent(v)}
        plugins={[
          typeaheadPlugin({
            configs: [
              {
                type: "user",
                trigger: "@",
                searchCallback: async (query) => {
                  console.log("user invoked");
                  const users = ["john", "mohn", "fohn"];
                  return users.filter((u) => u.startsWith(query));
                },
                renderMenuItem: (username) => (
                  <div className="user-menu-item" key={username}>
                    <span className="username">@{username}</span>
                  </div>
                ),
                maxResults: 10,
              },
              {
                type: "link",
                trigger: "[",
                searchCallback: async (query) => {
                  console.log("in callback");
                  const response = await fetch(
                    `${apiBase}/notes?search=${encodeURIComponent(query)}`,
                  );
                  const result = await response.json();
                  return result.map((r: NoteData) => r.title);
                },
                renderMenuItem: (link) => <span>[[{link}]]</span>,
              },
            ],
          }),
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarClassName: "flex flex-column",
            toolbarContents,
          }),
        ]}
      />
    </div>
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
