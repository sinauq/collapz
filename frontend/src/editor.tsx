import { filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  useCreateBlockNote,
  useEditorChange,
  type DefaultReactSuggestionItem,
  type SuggestionMenuProps,
} from "@blocknote/react";
import { useState } from "react";

import { apiBase } from "./apiRequests";
import { useFetch } from "./hooks/use-fetch";
import type { EditorProps, NoteData } from "./types";

export function NoteEditor({ data, setEditing }: EditorProps) {
  const [blocks, setBlocks] = useState(data?.blocks ?? "");
  const [content, setContent] = useState(data?.content ?? "");
  const [title, setTitle] = useState(data?.title ?? null);
  const [links, setLinks] = useState<number[]>([]);

  const { execute, loading } = useFetch();

  const handleSave = async () => {
    const user = localStorage.getItem("user");
    let ownerId;

    if (user) {
      ownerId = JSON.parse(user).id;
    } else {
      throw new Error("no user!!");
    }

    try {
      const param = data ? `/${data.id}` : "";
      const body = data
        ? JSON.stringify({ title, content, blocks })
        : JSON.stringify({
            title,
            content,
            blocks,
            owner: ownerId,
          });
      const response = await execute(`${apiBase}/notes${param}`, {
        method: data ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      for (const link of links) {
        await execute(`${apiBase}/notes/${response.id}/links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetId: link, relationship: "relates" }),
        });
      }
    } catch (e) {
      console.error("Error occured when creating/updating post", e);
    } finally {
      console.log("finally");

      if (setEditing) setEditing(false);
    }
  };
  // This is temporary, and won't be needed later
  let initialContent;
  try {
    initialContent = JSON.parse(blocks);
  } catch (e) {
    initialContent = [{ type: "paragraph", content }];
  }

  const editor = useCreateBlockNote({
    initialContent,
  });

  useEditorChange((editor) => {
    const blocksString = JSON.stringify(editor.document);
    const contentString = editor.blocksToMarkdownLossy(editor.document);
    setContent(contentString);
    setBlocks(blocksString);
  }, editor);
  // Renders the editor instance.
  return (
    <div>
      <input
        name="title"
        value={title}
        placeholder="Note Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      <BlockNoteView editor={editor}>
        <SuggestionMenuController
          triggerCharacter="[["
          getItems={async (query) => {
            const response = await fetch(`${apiBase}/notes?${query}`);
            const body: NoteData[] = await response.json();

            const suggestions = body.map(({ title, id }) => ({
              title,
              onItemClick: () => {
                editor.insertInlineContent([
                  { type: "link", content: title, href: `/notes/${id}` },
                ]);
                setLinks([...links, id]);
              },
            }));

            return filterSuggestionItems(suggestions, query);
          }}
          suggestionMenuComponent={CustomSlashMenu}
        />
      </BlockNoteView>
    </div>
  );
}

function CustomSlashMenu(
  props: SuggestionMenuProps<DefaultReactSuggestionItem>,
) {
  return (
    <div className={"slash-menu"}>
      {props.items.map((item, index) => (
        <div
          key={index}
          className={`slash-menu-item ${
            props.selectedIndex === index ? "selected" : ""
          }`}
          onClick={() => {
            props.onItemClick?.(item);
          }}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}
