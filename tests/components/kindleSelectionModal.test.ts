import type { App, TFile } from "obsidian";
import { KindleSelectionModal } from "../../src/components/kindleSelectionModal";
import { exportToMarkdown } from "../../src/processing/export";
import { parseKindleHtml } from "../../src/processing/parser/html-parser";
import type { KindleImportPluginSettings } from "../../src/settings/pluginSettings";

jest.mock("../../src/processing/export");
jest.mock("../../src/processing/parser/html-parser");

describe("KindleSelectionModal", () => {
  const parsed = { title: "t", authors: [], chapterHighlights: [] };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(parseKindleHtml).mockReturnValue(parsed);
  });

  test("reads file and exports", async () => {
    const fileContent = "abc";
    const vault = {
      cachedRead: jest.fn().mockResolvedValue(fileContent),
    };
    const app = { vault } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;

    const modal = new KindleSelectionModal(app, settings);
    const file = {} as TFile;

    await modal.onChooseSuggestion(file, new MouseEvent("click"));

    expect(vault.cachedRead).toHaveBeenCalledWith(file);
    expect(parseKindleHtml).toHaveBeenCalledWith(fileContent);
    expect(exportToMarkdown).toHaveBeenCalledWith(parsed, app, settings);
  });
});
