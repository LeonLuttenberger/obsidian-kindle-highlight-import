import type { BookHighlights, ChapterHighlights } from "src/processing/model";
import { parseAuthors } from "./utils";

function getElementValue(htmlDoc: Document, className: string): string {
  const elements = htmlDoc.getElementsByClassName(className);

  if (elements.length === 0) {
    throw Error(`Element ${className} not present.`);
  }

  const textContent = elements[0].textContent;

  if (!textContent) {
    throw Error(`Element ${className} is empty.`);
  }

  return textContent.trim();
}

function getPageNumber(text: string): number | undefined {
  const matches = text.match(/Page (\d+)/);
  if (matches) {
    return Number(matches[1]);
  }
  return undefined;
}

function getNoteType(text: string): "quote" | "note" {
  if (text.startsWith("Highlight")) {
    return "quote";
  } else {
    return "note";
  }
}

export function parseKindleHtml(text: string): BookHighlights {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(text, "text/html");

  const title = getElementValue(htmlDoc, "bookTitle");
  const authors = parseAuthors(getElementValue(htmlDoc, "authors"));
  const chapterHighlights: ChapterHighlights[] = [];

  Array.from(htmlDoc.querySelectorAll(".sectionHeading,.noteText")).forEach((element) => {
    const className = element.className;

    if (className === "sectionHeading") {
      const chapterName = element.textContent?.trim();
      if (!chapterName) {
        throw Error("Chapter name is empty.");
      }
      chapterHighlights.push({ chapterName, highlights: [] });
      return;
    }

    const chapter = chapterHighlights[chapterHighlights.length - 1];

    const noteTextContent = element.textContent?.trim();
    if (!noteTextContent) {
      throw Error("Note text is empty.");
    }

    const noteHeadingElement = element.previousElementSibling;
    const noteHeadingTextContent = noteHeadingElement?.textContent?.trim();

    if (!noteHeadingTextContent || noteHeadingElement?.className !== "noteHeading") {
      throw Error("Note heading is empty or not found.");
    }

    const pageNumber = getPageNumber(noteHeadingTextContent);

    chapter.highlights.push({
      text: noteTextContent,
      pageNumber: pageNumber,
      type: getNoteType(noteHeadingTextContent),
    });
  });

  return { title, authors, chapterHighlights };
}
