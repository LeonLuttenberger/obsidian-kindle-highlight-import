import { Notice, SuggestModal, TFile } from 'obsidian';

interface KindleNotebookPath {
  filename: string;
  fullPath: string;
}

export class KindleSelectionModal extends SuggestModal<KindleNotebookPath> {

  static fileToInterface(file: TFile): KindleNotebookPath {
    return {filename: file.name, fullPath: file.path};
  }

    // Returns all available suggestions.
    getSuggestions(query: string): KindleNotebookPath[] {
      const htmlFiles = this.app.vault.getFiles().filter(
        (file) => file.extension === "html" && file.path.startsWith("Attachments/Kindle/")
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
