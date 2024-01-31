import { App, SuggestModal, TFile } from "obsidian";
import { exportToMarkdown } from "src/processing/export";
import { kindleHTMLParser } from "src/processing/parser";
import { KindleImportPluginSettings } from "src/settings/pluginSettings";

export class KindleSelectionModal extends SuggestModal<TFile> {
  settings: KindleImportPluginSettings;

  constructor(app: App, settings: KindleImportPluginSettings) {
    super(app);

    this.settings = settings;
  }

  // Returns all available suggestions.
  getSuggestions(query: string): TFile[] {
    const htmlFiles = this.app.vault
      .getFiles()
      .filter((file) => file.extension === "html" && file.path.startsWith(this.settings.notebooksLocation));

    return htmlFiles.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));
  }

  // Renders each suggestion item.
  renderSuggestion(book: TFile, el: HTMLElement): void {
    el.createEl("div", { text: book.name });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): void {
    this.app.vault.cachedRead(file).then((content) => {
      const notebook = kindleHTMLParser(content);
      exportToMarkdown(notebook, this.app, this.settings);
    });
  }
}
