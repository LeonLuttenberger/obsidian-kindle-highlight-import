import type { App, TFile } from "obsidian";
import { KindleSelectionModal } from "../../src/components/kindleSelectionModal";
import { exportToMarkdown } from "../../src/processing/export";
import { parseKindleHtml } from "../../src/processing/parser/html-parser";
import { parseKindlePdf } from "../../src/processing/parser/pdf-parser";
import type { KindleImportPluginSettings } from "../../src/settings/pluginSettings";

jest.mock("../../src/processing/export");
jest.mock("../../src/processing/parser/html-parser");
jest.mock("../../src/processing/parser/pdf-parser");

// Helper for spies that should be called exactly once.
// Works for functions that return void (e.g., exportToMarkdown).
type Fn = (...args: unknown[]) => unknown;

function whenCalledOnce<F extends Fn>(mock: {
  mockImplementationOnce: (fn: (...args: Parameters<F>) => ReturnType<F>) => unknown;
}): Promise<Parameters<F>> {
  return new Promise<Parameters<F>>((resolve) => {
    mock.mockImplementationOnce((...args: Parameters<F>) => {
      resolve(args);
      return undefined as ReturnType<F>;
    });
  });
}

describe("KindleSelectionModal", () => {
  const parsed = { title: "t", authors: [], chapterHighlights: [] };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(parseKindleHtml).mockReturnValue(parsed);
    jest.mocked(parseKindlePdf).mockReturnValue(Promise.resolve(parsed));
  });

  test("reads HTML file and exports", async () => {
    const fileContent = "abc";
    const vault = {
      cachedRead: jest.fn().mockResolvedValue(fileContent),
    };
    const app = { vault } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;

    const modal = new KindleSelectionModal(app, settings);
    const file = { extension: "html" } as TFile;

    const done = whenCalledOnce(jest.mocked(exportToMarkdown));

    modal.onChooseSuggestion(file, new MouseEvent("click"));

    await done;

    expect(vault.cachedRead).toHaveBeenCalledWith(file);
    expect(parseKindleHtml).toHaveBeenCalledWith(fileContent);
    expect(exportToMarkdown).toHaveBeenCalledWith(parsed, app, settings);
  });

  test("reads PDF file and exports", async () => {
    const fileContent = "abc";
    const vault = {
      readBinary: jest.fn().mockResolvedValue(fileContent),
    };
    const app = { vault } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;

    const modal = new KindleSelectionModal(app, settings);
    const file = { extension: "pdf" } as TFile;

    const done = whenCalledOnce(jest.mocked(exportToMarkdown));

    modal.onChooseSuggestion(file, new MouseEvent("click"));

    const [notebookArg, appArg, settingsArg] = await done;

    expect(vault.readBinary).toHaveBeenCalledWith(file);
    expect(parseKindlePdf).toHaveBeenCalledWith(fileContent);

    expect(notebookArg).toBe(parsed);
    expect(appArg).toBe(app);
    expect(settingsArg).toBe(settings);
  });
});
