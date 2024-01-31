export interface KindleImportPluginSettings {
  notebooksLocation: string;
  exportLocation: string;
  queryGoodreads: boolean;
  goodreadsUserID?: string;
}

export const DefaultSettings: KindleImportPluginSettings = {
  notebooksLocation: "default/",
  exportLocation: "",
  queryGoodreads: false,
};
