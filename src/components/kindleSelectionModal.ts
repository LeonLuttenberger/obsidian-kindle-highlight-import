import { App, Notice, SuggestModal, TFile } from 'obsidian';
import { KindleImportPluginSettings } from 'src/settings/pluginSettings';

interface KindleNotebookPath {
  filename: string;
  fullPath: string;
}

export class KindleSelectionModal extends SuggestModal<KindleNotebookPath> {
  settings: KindleImportPluginSettings;

  constructor(app: App, settings: KindleImportPluginSettings) {
    super(app);

    this.settings = settings;
  }

  static fileToInterface(file: TFile): KindleNotebookPath {
    return {filename: file.name, fullPath: file.path};
  }

    // Returns all available suggestions.
    getSuggestions(query: string): KindleNotebookPath[] {
      const htmlFiles = this.app.vault.getFiles().filter(
        (file) => file.extension === "html" && file.path.startsWith(this.settings.notebooksLocation)
      ).map((file) => KindleSelectionModal.fileToInterface(file));

      return htmlFiles.filter((notebook) =>
        notebook.filename.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    // Renders each suggestion item.
    renderSuggestion(book: KindleNotebookPath, el: HTMLElement) {
      el.createEl("div", { text: book.filename });
    }
  
    // Perform action on the selected suggestion.
    onChooseSuggestion(book: KindleNotebookPath, evt: MouseEvent | KeyboardEvent) {
      new Notice(`Selected ${book.filename}`);
    }
  }
