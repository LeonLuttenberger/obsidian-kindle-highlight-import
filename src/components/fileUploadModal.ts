import { App, Modal } from "obsidian";
import { exportToMarkdown } from "src/processing/export";
import { kindleHTMLParser } from "src/processing/parser";
import { KindleImportPluginSettings } from "src/settings/pluginSettings";

export class FileUploadModal extends Modal {
  settings: KindleImportPluginSettings;

  constructor(app: App, settings: KindleImportPluginSettings) {
    super(app);

    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.innerHTML = `
      <input type="file" id="fileInput" accept=".html" />
    `;

    const input = contentEl.querySelector("#fileInput") as HTMLInputElement;

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (file) {
        const content = await file.text();
        const notebook = kindleHTMLParser(content);
        exportToMarkdown(notebook, this.app, this.settings);
      }

      this.close();
    });

    // Auto-focus and open file picker on desktop/mobile
    setTimeout(() => input.click(), 10); // Triggers file picker immediately
  }

  onClose() {
    this.contentEl.empty();
  }
}
