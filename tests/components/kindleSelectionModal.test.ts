import { KindleSelectionModal } from "../../src/components/kindleSelectionModal";
import { kindleHTMLParser } from "../../src/processing/parser";
import { exportToMarkdown } from "../../src/processing/export";
import type { App } from "obsidian";
import type { TFile } from "obsidian";
import type { KindleImportPluginSettings } from "../../src/settings/pluginSettings";

jest.mock("../../src/processing/export");
jest.mock("../../src/processing/parser");

describe("KindleSelectionModal", () => {
  const parsed = { title: "t", authors: [], chapterHighlights: [] };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(kindleHTMLParser).mockReturnValue(parsed as any);
  });

  test("reads file and exports", async () => {
    const fileContent = "abc";
    const vault = {
      cachedRead: jest.fn().mockResolvedValue(fileContent)
    };
    const app = { vault } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;

    const modal = new KindleSelectionModal(app, settings);
    const file = {} as TFile;

    await modal.onChooseSuggestion(file, new MouseEvent("click"));

    expect(vault.cachedRead).toHaveBeenCalledWith(file);
    expect(kindleHTMLParser).toHaveBeenCalledWith(fileContent);
    expect(exportToMarkdown).toHaveBeenCalledWith(parsed, app, settings);
  });
});
