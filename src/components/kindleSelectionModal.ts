import { type App, Notice, SuggestModal, type TFile } from "obsidian";
import { ACCEPTED_EXTENSIONS } from "src/components/component-utils";
import { exportToMarkdown } from "src/processing/export";
import type { BookHighlights } from "src/processing/model";
import { parseKindleHtml } from "src/processing/parser/html-parser";
import { parseKindlePdf } from "src/processing/parser/pdf-parser";
import type { KindleImportPluginSettings } from "src/settings/pluginSettings";

export class KindleSelectionModal extends SuggestModal<TFile> {
  settings: KindleImportPluginSettings;

  constructor(app: App, settings: KindleImportPluginSettings) {
    super(app);

    this.settings = settings;
  }

  // Returns all available suggestions.
  getSuggestions(query: string): TFile[] {
    return this.app.vault
      .getFiles()
      .filter((file) => ACCEPTED_EXTENSIONS.includes(file.extension))
      .filter((file) => file.path.startsWith(this.settings.notebooksLocation))
      .filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));
  }

  // Renders each suggestion item.
  renderSuggestion(book: TFile, el: HTMLElement): void {
    el.createEl("div", { text: book.name });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(file: TFile, _evt: MouseEvent | KeyboardEvent): void {
    let notebookPromise: Promise<BookHighlights>;

    if (file.extension === "pdf") {
      notebookPromise = this.app.vault.readBinary(file).then(async (content) => {
        return await parseKindlePdf(content);
      });
    } else if (file.extension === "html") {
      notebookPromise = this.app.vault.cachedRead(file).then((content) => {
        return parseKindleHtml(content);
      });
    } else {
      new Notice("Unsupported file type. Please select a PDF or HTML file.");
      return;
    }

    notebookPromise.then((notebook) => {
      exportToMarkdown(notebook, this.app, this.settings);
    });
  }
}
