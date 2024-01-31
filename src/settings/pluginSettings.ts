export interface KindleImportPluginSettings {
  notebooksLocation: string;
  exportLocation: string;
  goodreadsUserID?: string;
}

export const DefaultSettings: KindleImportPluginSettings = {
  notebooksLocation: "default/",
  exportLocation: "",
};
