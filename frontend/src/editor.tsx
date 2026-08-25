import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import {
  SuggestionMenuController,
  useCreateBlockNote,
  useEditorChange,
  type DefaultReactSuggestionItem,
  type SuggestionMenuProps,
} from "@blocknote/react";

import {
  BlockNoteSchema,
  filterSuggestionItems,
  type BlockSchema,
  type InlineContentSchema,
  type StyleSchema,
} from "@blocknote/core";
import { apiBase } from "./apiRequests";
import type { EditorProps, NoteData } from "./types";
import { useState } from "react";
import { useFetch } from "./hooks/use-fetch";

export function NoteEditor({ data, setEditing }: EditorProps) {
  const [blocks, setBlocks] = useState(data.blocks);
  const [content, setContent] = useState(data.content);
  const [title, setTitle] = useState(data.title);
  const [links, setLinks] = useState<number[]>([]);

  const { execute, loading } = useFetch();

  const handleSave = async () => {
    try {
      await execute(`${apiBase}/notes/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, blocks }),
      });
      for (const link of links) {
        await execute(`${apiBase}/notes/${data.id}/links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetId: link, relationship: "relates" }),
        });
      }
    } finally {
      console.log("finally");
      setEditing(false);
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
