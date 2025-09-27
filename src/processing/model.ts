export type HightlightType = "quote" | "note";

export interface Highlight {
  text: string;
  pageNumber?: number;
  location?: number;
  sectionTitle?: string;
  type: HightlightType;
}

export interface ChapterHighlights {
  chapterName?: string;
  highlights: Highlight[];
}

export interface BookHighlights {
  title: string;
  authors: string[];
  chapterHighlights: ChapterHighlights[];
}
