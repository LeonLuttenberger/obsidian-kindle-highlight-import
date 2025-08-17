import type { App } from "obsidian";
import { FileUploadModal } from "../../src/components/fileUploadModal";
import { exportToMarkdown } from "../../src/processing/export";
import { parseKindleHtml } from "../../src/processing/parser/html-parser";
import type { KindleImportPluginSettings } from "../../src/settings/pluginSettings";

jest.mock("../../src/processing/export");
jest.mock("../../src/processing/parser/html-parser");

describe("FileUploadModal", () => {
  const parsed = { title: "t", authors: [], chapterHighlights: [] };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(parseKindleHtml).mockReturnValue(parsed);
  });

  test("parses selected file and exports", async () => {
    const app = { vault: {} } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;
    const modal = new FileUploadModal(app, settings);

    modal.onOpen();

    const input = modal.contentEl.querySelector("input") as HTMLInputElement;
    const file = { text: () => Promise.resolve("content") } as File;
    Object.defineProperty(input, "files", { value: [file] });

    input.dispatchEvent(new Event("change"));
    await Promise.resolve();

    expect(parseKindleHtml).toHaveBeenCalledWith("content");
    expect(exportToMarkdown).toHaveBeenCalledWith(parsed, app, settings);
  });
});
