import type { DefaultSuggestionItem } from "@blocknote/core";

export type LinkData = {
  title: string;
  id: string;
  relationship: string;
  content: string;
};

export type NoteData = {
  title: string;
  id: number;
  relationships: {
    backLinks: Array<LinkData>;
    forwardLinks: Array<LinkData>;
  };
  content: string;
  blocks: string;
  owner: string;
};

export interface EditorProps {
  data?: NoteData;
  setEditing?: (arg0: boolean) => void;
}

export type NotesSuggestionItem = DefaultSuggestionItem & NoteData;
