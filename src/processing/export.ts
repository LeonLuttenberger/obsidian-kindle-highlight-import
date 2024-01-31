import { App, Notice } from "obsidian";
import { BookHighlights, Highlight, ChapterHighlights } from "src/processing/parser";
import { KindleImportPluginSettings } from "src/settings/pluginSettings";

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

function stringifyBookHighlights(notebook: BookHighlights, settings: KindleImportPluginSettings): string {
  const lines: string[] = [];

  // markdown properties
  lines.push("---");
  lines.push("tags:");
  lines.push("  - books");
  lines.push(`author: ${notebook.authors}`);
  lines.push("---");

  // markdown contents
  lines.push(notebook.title);
  lines.push("");

  lines.push(`Author: ${notebook.authors}`);
  lines.push("");

  lines.push("## Highlights");
  lines.push("");

  notebook.chapterHighlights.forEach((chapterHighlights: ChapterHighlights) => {
    lines.push(`### ${chapterHighlights.chapterName}`);
    lines.push("");

    chapterHighlights.highlights.forEach((highlight: Highlight) => {
      lines.push(highlightToQuoteString(highlight));
      lines.push("");
    });
  });

  return lines.join("\n");
}

export function exportToMarkdown(notebook: BookHighlights, app: App, settings: KindleImportPluginSettings): void {
  const md_file_name = getMdFileTitle(notebook.title);

  let md_file_path: string;
  if (settings.exportLocation) {
    md_file_path = `${settings.exportLocation}/${md_file_name}.md`;
  } else {
    md_file_path = `${md_file_name}.md`;
  }

  if (app.vault.getAbstractFileByPath(md_file_path)) {
    new Notice("File already exists. Skipping export.");
    return;
  }

  const text = stringifyBookHighlights(notebook, settings);

  app.vault.create(md_file_path, text);
  new Notice(`Exported notes for ${notebook.title}`);
}
