import type { App } from "obsidian";
import { FileUploadModal } from "../../src/components/fileUploadModal";
import { exportToMarkdown } from "../../src/processing/export";
import { parseKindleHtml } from "../../src/processing/parser/html-parser";
import { parseKindlePdf } from "../../src/processing/parser/pdf-parser";
import type { KindleImportPluginSettings } from "../../src/settings/pluginSettings";

jest.mock("../../src/processing/export");
jest.mock("../../src/processing/parser/html-parser");
jest.mock("../../src/processing/parser/pdf-parser");

describe("FileUploadModal", () => {
  const parsed = { title: "t", authors: [], chapterHighlights: [] };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(parseKindleHtml).mockReturnValue(parsed);
    jest.mocked(parseKindlePdf).mockReturnValue(Promise.resolve(parsed));
  });

  test("parses selected HTML file and exports", async () => {
    const app = { vault: {} } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;
    const modal = new FileUploadModal(app, settings);

    modal.onOpen();

    const input = modal.contentEl.querySelector("input") as HTMLInputElement;
    const file = { name: "notebook.html", text: () => Promise.resolve("content") } as File;
    Object.defineProperty(input, "files", { value: [file] });

    input.dispatchEvent(new Event("change"));
    await Promise.resolve();

    expect(parseKindleHtml).toHaveBeenCalledWith("content");
    expect(exportToMarkdown).toHaveBeenCalledWith(parsed, app, settings);
  });

  test("parses selected PDF file and exports", async () => {
    const app = { vault: {} } as unknown as App;
    const settings = { notebooksLocation: "", exportLocation: "", queryGoodreads: false } as KindleImportPluginSettings;
    const modal = new FileUploadModal(app, settings);

    modal.onOpen();

    const input = modal.contentEl.querySelector("input") as HTMLInputElement;
    const file = { name: "notebook.pdf", arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) } as File;
    Object.defineProperty(input, "files", { value: [file] });

    input.dispatchEvent(new Event("change"));
    await Promise.resolve();
    await Promise.resolve();

    expect(parseKindlePdf).toHaveBeenCalledWith(new ArrayBuffer(0));

    expect(exportToMarkdown).toHaveBeenCalledWith(parsed, app, settings);
  });
});
