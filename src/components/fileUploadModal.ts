import { type App, Modal } from "obsidian";
import { exportToMarkdown } from "src/processing/export";
import type { BookHighlights } from "src/processing/model";
import { parseKindleHtml } from "src/processing/parser/html-parser";
import { parseKindlePdf } from "src/processing/parser/pdf-parser";
import type { KindleImportPluginSettings } from "src/settings/pluginSettings";

const FILE_PICKER_TRIGGER_DELAY_MS = 10;

const ACCEPTED_EXTENSIONS = ["html", "pdf"];

export class FileUploadModal extends Modal {
  settings: KindleImportPluginSettings;

  constructor(app: App, settings: KindleImportPluginSettings) {
    super(app);

    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;

    // Hide the entire modal container so that only the file picker shows up
    this.modalEl.classList.add("kindle-import-hidden-modal");

    // Create and configure the file input element safely
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(",");
    fileInput.multiple = false;

    // Parse file when the user selects it
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];

      if (file) {
        let notebook: BookHighlights;

        if (file.name.endsWith(".pdf")) {
          const content = await file.arrayBuffer();
          notebook = await parseKindlePdf(content);
        } else {
          const content = await file.text();
          notebook = parseKindleHtml(content);
        }
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
