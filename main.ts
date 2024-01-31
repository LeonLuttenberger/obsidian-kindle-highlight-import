import { App, Modal, Plugin, PluginSettingTab, Setting } from "obsidian";

import { DefaultSettings, KindleImportPluginSettings } from "src/settings/pluginSettings";
import { KindleSelectionModal } from "src/components/kindleSelectionModal";

export default class KindleImportPlugin extends Plugin {
  settings: KindleImportPluginSettings;

  async onload() {
    await this.loadSettings();

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: "kindle-import",
      name: "Import Kindle Notebook",
      callback: () => {
        new KindleSelectionModal(this.app, this.settings).open();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, "click", (evt: MouseEvent) => {
      console.log("click", evt);
    });

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DefaultSettings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText("Woah!");
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Notebook Location")
      .setDesc("Path to notebook folder")
      .addText((text) =>
        text
          .setPlaceholder("Enter the path")
          .setValue(this.plugin.settings.notebooksLocation)
          .onChange(async (value) => {
            this.plugin.settings.notebooksLocation = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Book Notes Location")
      .setDesc("Path to book notes folder")
      .addText((text) =>
        text
          .setPlaceholder("Enter the path")
          .setValue(this.plugin.settings.exportLocation)
          .onChange(async (value) => {
            this.plugin.settings.exportLocation = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Goodreads User ID")
      .setDesc("ID of your Goodreads user")
      .addText((text) =>
        text
          .setPlaceholder("Enter the user ID")
          .setValue(this.plugin.settings.goodreadsUserID)
          .onChange(async (value) => {
            this.plugin.settings.goodreadsUserID = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
