import FolderSuggest from "../../src/components/folderSuggest";
import type { App, TFolder } from "obsidian";

describe("FolderSuggest", () => {
  test("filters folders", () => {
    const folders: TFolder[] = [
      { path: "a/b" } as TFolder,
      { path: "c/d" } as TFolder
    ];
    const vault = {
      getAllFolders: jest.fn().mockReturnValue(folders)
    };
    const app = { vault } as unknown as App;
    const input = document.createElement("input");

    const suggest = new FolderSuggest(app, input);
    const result = suggest.getSuggestions("b");
    expect(result).toEqual([folders[0]]);
  });
});
