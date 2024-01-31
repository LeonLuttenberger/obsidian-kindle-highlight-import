export interface Highlight {
  text: string;
  pageNumber?: number;
  type: "quote" | "note";
}

export interface ChapterHighlights {
  chapterName: string;
  highlights: Highlight[];
}

export interface BookHighlights {
  title: string;
  authors: string;
  chapterHighlights: ChapterHighlights[];
}

function getElementValue(htmlDoc: Document, className: string): string {
  const elements = htmlDoc.getElementsByClassName(className);

  if (elements.length == 0) {
    throw Error(`Element ${className} not present.`);
  }

  const textContent = elements[0].textContent;

  if (!textContent) {
    throw Error(`Element ${className} is empty.`);
  }

  return textContent.trim();
}

function getPageNumber(text: string): number {
  const matches = text.match(/Page (\d+)/);
  if (matches) {
    return Number(matches[1]);
  }
}

function getNoteType(text: string): "quote" | "note" {
  if (text.startsWith("Highlight")) {
    return "quote";
  } else {
    return "note";
  }
}

export function kindleHTMLParser(text: string): BookHighlights {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(text, "text/html");

  const title = getElementValue(htmlDoc, "bookTitle");
  const authors = getElementValue(htmlDoc, "authors");
  const chapterHighlights: ChapterHighlights[] = [];

  Array.from(htmlDoc.querySelectorAll(".sectionHeading,.noteText")).forEach((element) => {
    const className = element.className;

    if (className == "sectionHeading") {
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

    if (!noteHeadingTextContent || noteHeadingElement?.className != "noteHeading") {
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
