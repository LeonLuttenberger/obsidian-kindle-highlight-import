import { loadPdfJs } from "obsidian";
import type { BookHighlights, Highlight } from "src/processing/model";
import { parseAuthors } from "src/processing/parser/utils";

async function extractPdfText(buffer: ArrayBuffer): Promise<string[]> {
  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument(buffer).promise;

  const textItems: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    textItems.push(...textContent.items.map((item: any) => item.str));
  }

  return textItems.map((s) => s.trim());
}

function getTitle(lines: string[]): string {
  const title = lines.find((line) => line.trim() !== "");
  if (!title) {
    throw new Error("No title found in PDF text");
  }
  return title.trim();
}

function getAuthors(lines: string[]): string[] {
  // Author: line after "by"
  const byIdx = lines.findIndex((line) => line.toLowerCase().startsWith("by "));

  if (byIdx === -1) {
    throw new Error("No author found in PDF text");
  }

  return parseAuthors(lines[byIdx].replace(/^by\s+/i, "").trim());
}

function matchHighlightType(line: string): "quote" | "quote_and_note" | undefined {
  const quoteRegex = /^Highlight \(Yellow\) \| Page \d+$/i;
  const noteRegex = /^Highlight \(Yellow\) and Note \| Page \d+$/i;

  if (quoteRegex.test(line)) {
    return "quote";
  }

  if (noteRegex.test(line)) {
    return "quote_and_note";
  }

  // No match
  return undefined;
}

function matchPage(line: string): number | undefined {
  const pageMatch = line.match(/Page (\d+)/i);
  return pageMatch ? parseInt(pageMatch[1], 10) : undefined;
}

function parsePdfTextLines(lines: string[]): BookHighlights {
  // Remove lines that just have a single number (PDF page nunber)
  const filteredLines = lines
    .filter((line) => !/^\d+$/.test(line.trim()))
    .filter((line) => !/^Page \d+$/i.test(line.trim()));

  // Parse title and authors
  const title = getTitle(filteredLines);
  const authors = getAuthors(filteredLines);

  // Find all highlight blocks
  const highlights: Highlight[] = [];
  let i = 0;
  while (i < filteredLines.length) {
    const matchType = matchHighlightType(filteredLines[i]);
    if (!matchType) {
      i++;
      continue; // Skip lines that are not highlights
    }

    // If we have a match, it must be either a quote or a quote_and_note
    const pageNumber = matchPage(filteredLines[i]);
    i++; // Move to next line

    if (filteredLines[i].trim() === "") {
      // Skip empty line after highlight header
      i++;
    }

    // Collect quote text until next empty line
    const quoteLines: string[] = [];
    while (i < filteredLines.length && filteredLines[i].trim() !== "") {
      quoteLines.push(filteredLines[i]);
      i++;
    }

    highlights.push({
      text: quoteLines.join(" "),
      pageNumber: pageNumber,
      type: "quote",
    });

    // If this was a quote_and_note, we need to collect the note text
    if (matchType === "quote_and_note") {
      // Skip empty line after quote
      i++;

      // Collect note text until next "Page", "Highlight", or end
      const noteLines: string[] = [];
      while (i < filteredLines.length && filteredLines[i].trim() !== "" && !matchHighlightType(filteredLines[i])) {
        noteLines.push(filteredLines[i]);
        i++;
      }

      highlights.push({
        text: noteLines.join(" "),
        pageNumber: pageNumber,
        type: "note",
      });
    }
  }

  return {
    title,
    authors,
    chapterHighlights: [
      {
        highlights: highlights,
      },
    ],
  };
}

export async function parseKindlePdf(data: ArrayBuffer): Promise<BookHighlights> {
  const textData = await extractPdfText(data);
  return parsePdfTextLines(textData);
}
