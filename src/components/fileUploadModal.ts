import { App, Modal } from "obsidian";
import { exportToMarkdown } from "src/processing/export";
import { kindleHTMLParser } from "src/processing/parser";
import { KindleImportPluginSettings } from "src/settings/pluginSettings";

import "styles.css";

const FILE_PICKER_TRIGGER_DELAY_MS = 10;

export class FileUploadModal extends Modal {
  settings: KindleImportPluginSettings;

  constructor(app: App, settings: KindleImportPluginSettings) {
    super(app);

    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;

    // Hide the entire modal container so that only the file picker shows up
    this.modalEl.classList.add("hidden-modal");

    // Create and configure the file input element safely
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".html";
    fileInput.multiple = false;

    // Parse file when the user selects it
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (file) {
        const content = await file.text();
        const notebook = kindleHTMLParser(content);
        exportToMarkdown(notebook, this.app, this.settings);
      }

      this.close();
    });

    contentEl.appendChild(fileInput);

    // Close the modal when the user cancels the file selection
    fileInput.addEventListener("cancel", (_event) => {
      this.close();
    });

    // Auto-focus and open file picker on desktop/mobile
    setTimeout(() => fileInput.click(), FILE_PICKER_TRIGGER_DELAY_MS); // Triggers file picker immediately
  }

  onClose() {
    this.contentEl.empty();
  }
}
