import { type App, Notice, normalizePath } from "obsidian";
import { queryGoodreadsForBookID } from "src/processing/goodreads";
import type { BookHighlights, ChapterHighlights, Highlight } from "src/processing/model";
import type { KindleImportPluginSettings } from "src/settings/pluginSettings";

function getMdFileTitle(bookTitle: string): string {
  if (bookTitle.includes(":")) {
    return bookTitle.split(":")[0].trim();
  }

  return bookTitle.trim();
}

function highlightToQuoteString(highlight: Highlight): string {
  let titleLine: string;

  if (highlight.type === "note") {
    titleLine = "> [!note] Note";
  } else if (highlight.type === "quote") {
    if (highlight.pageNumber) {
      titleLine = `> [!quote] Quote (Page ${highlight.pageNumber})`;
    } else {
      titleLine = "> [!quote] Quote";
    }
  } else {
    throw new Error(`Invalid highlight type: ${highlight.type}`);
  }

  const textLine = highlight.text;
  return `${titleLine}\n${textLine}`;
}

function stringifyBookHighlights(
  notebook: BookHighlights,
  goodreadsBookID: string | undefined,
  goodreadsUserID: string | undefined,
): string {
  const lines: string[] = [];

  // markdown properties
  lines.push("---");
  lines.push("tags:");
  lines.push("  - books");
  lines.push(`author: ${notebook.authors.join("; ")}`);
  lines.push("---");

  // markdown contents
  if (goodreadsBookID) {
    const bookURL = `https://www.goodreads.com/book/show/${goodreadsBookID}`;
    lines.push(`[${notebook.title}](${bookURL})`);
  } else {
    lines.push(notebook.title);
  }

  if (goodreadsUserID && goodreadsBookID) {
    const highlightsURL = `https://www.goodreads.com/notes/${goodreadsBookID}/${goodreadsUserID}`;
    lines.push(`[My Kindle Notes & Highlights](${highlightsURL})`);
  }

  lines.push("");

  lines.push(`Author: ${notebook.authors.join("; ")}`);
  lines.push("");

  lines.push("## Highlights");
  lines.push("");

  notebook.chapterHighlights.forEach((chapterHighlights: ChapterHighlights) => {
    if (chapterHighlights.chapterName) {
      lines.push(`### ${chapterHighlights.chapterName}`);
      lines.push("");
    }

    chapterHighlights.highlights.forEach((highlight: Highlight) => {
      lines.push(highlightToQuoteString(highlight));
      lines.push("");
    });
  });

  return lines.join("\n");
}

export async function exportToMarkdown(
  notebook: BookHighlights,
  app: App,
  settings: KindleImportPluginSettings,
): Promise<void> {
  const md_file_name = getMdFileTitle(notebook.title);

  let md_file_path: string;
  if (settings.exportLocation) {
    md_file_path = normalizePath(`${settings.exportLocation}/${md_file_name}.md`);
  } else {
    md_file_path = normalizePath(`${md_file_name}.md`);
  }

  if (app.vault.getAbstractFileByPath(md_file_path)) {
    new Notice("File already exists. Skipping export.");
    return;
  }

  let goodreadsBookID: string | undefined;
  if (settings.queryGoodreads) {
    goodreadsBookID = await queryGoodreadsForBookID(notebook.title, notebook.authors);
  }

  const text = stringifyBookHighlights(notebook, goodreadsBookID, settings.goodreadsUserID);

  app.vault.create(md_file_path, text);

  if (settings.queryGoodreads && !goodreadsBookID) {
    new Notice("No Goodreads book ID found. Check the console for more information.");
  }
  new Notice(`Exported notes for ${notebook.title}`);
}
