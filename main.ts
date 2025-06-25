import { App, Plugin, PluginSettingTab, Setting, normalizePath } from "obsidian";
import FolderSuggest from "src/components/folderSuggest";

import { DefaultSettings, KindleImportPluginSettings } from "src/settings/pluginSettings";
import { FileUploadModal } from "src/components/fileUploadModal";
import { KindleSelectionModal } from "src/components/kindleSelectionModal";

export default class KindleImportPlugin extends Plugin {
  settings: KindleImportPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "import-from-file-picker",
      name: "Import Kindle notebook with file picker",
      callback: () => {
        new FileUploadModal(this.app, this.settings).open();
      },
    });

    this.addCommand({
      id: "import-from-vault",
      name: "Import Kindle notebook from vault",
      callback: () => {
        new KindleSelectionModal(this.app, this.settings).open();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new KindleImportPluginSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DefaultSettings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class KindleImportPluginSettingTab extends PluginSettingTab {
  plugin: KindleImportPlugin;

  constructor(app: App, plugin: KindleImportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Notebook location")
      .setDesc("Path to notebook folder")
      .addText((text) => {
        text
          .setPlaceholder("Enter the path")
          .setValue(this.plugin.settings.notebooksLocation)
          .onChange(async (value) => {
            this.plugin.settings.notebooksLocation = normalizePath(value);
            await this.plugin.saveSettings();
          });
        new FolderSuggest(this.app, text.inputEl);
      });

    new Setting(containerEl)
      .setName("Book notes location")
      .setDesc("Path to book notes folder")
      .addText((text) => {
        text
          .setPlaceholder("Enter the path")
          .setValue(this.plugin.settings.exportLocation)
          .onChange(async (value) => {
            this.plugin.settings.exportLocation = normalizePath(value);
            await this.plugin.saveSettings();
          });
        new FolderSuggest(this.app, text.inputEl);
      });

    new Setting(containerEl)
      .setName("Query Goodreads")
      .setDesc("If checked, the plugin will query Goodreads to generate a link to the book page")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.queryGoodreads).onChange(async (value) => {
          this.plugin.settings.queryGoodreads = value;
          await this.plugin.saveSettings();
          this.display();
        }),
      );

    if (this.plugin.settings.queryGoodreads) {
      new Setting(containerEl)
        .setName("Goodreads user ID")
        .setDesc("ID of your Goodreads user")
        .addText((text) =>
          text
            .setPlaceholder("Enter the user ID")
            .setValue(this.plugin.settings.goodreadsUserID ?? "")
            .onChange(async (value) => {
              this.plugin.settings.goodreadsUserID = value;
              await this.plugin.saveSettings();
            }),
        );
    }
  }
}
