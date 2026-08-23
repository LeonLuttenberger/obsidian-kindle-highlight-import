import { type App, normalizePath, Plugin, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import { FileUploadModal } from "src/components/fileUploadModal";
import FolderSuggest from "src/components/folderSuggest";
import { KindleSelectionModal } from "src/components/kindleSelectionModal";
import { DefaultSettings, type KindleImportPluginSettings } from "src/settings/pluginSettings";

export default class KindleImportPlugin extends Plugin {
  declare settings: KindleImportPluginSettings;
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

  getSettingDefinitions(): SettingDefinitionItem<string>[] {
    return [
      {
        name: "Notebook location",
        desc: "Path to notebook folder",
        render: (setting) => {
          setting.addText((text) => {
            text
              .setPlaceholder("Enter the path")
              .setValue(this.plugin.settings.notebooksLocation)
              .onChange(async (value) => {
                this.plugin.settings.notebooksLocation = normalizePath(value);
                await this.plugin.saveSettings();
              });
            new FolderSuggest(this.app, text.inputEl);
          });
        },
      },
      {
        name: "Book notes location",
        desc: "Path to book notes folder",
        render: (setting) => {
          setting.addText((text) => {
            text
              .setPlaceholder("Enter the path")
              .setValue(this.plugin.settings.exportLocation)
              .onChange(async (value) => {
                this.plugin.settings.exportLocation = normalizePath(value);
                await this.plugin.saveSettings();
              });
            new FolderSuggest(this.app, text.inputEl);
          });
        },
      },
      {
        name: "Query Goodreads",
        desc: "If checked, the plugin will query Goodreads to generate a link to the book page",
        control: {
          type: "toggle",
          key: "queryGoodreads",
        },
      },
      {
        name: "Goodreads user ID",
        desc: "ID of your Goodreads user",
        control: {
          type: "text",
          key: "goodreadsUserID",
        },
        visible: () => this.plugin.settings.queryGoodreads,
      },
    ] as SettingDefinitionItem<string>[];
  }
}
