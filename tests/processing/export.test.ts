import { jest } from "@jest/globals";
import type { App, TAbstractFile } from "obsidian";
import { exportToMarkdown } from "../../src/processing/export";
import { queryGoodreadsForBookID } from "../../src/processing/goodreads";
import type { BookHighlights } from "../../src/processing/model";
import type { KindleImportPluginSettings } from "../../src/settings/pluginSettings";

jest.mock("obsidian", () => ({
  normalizePath: (path: string) => path,
  App: class {},
  Notice: class {},
}));

jest.mock("../../src/processing/goodreads", () => ({
  queryGoodreadsForBookID: jest.fn(),
}));

describe("Export", () => {
  let app: jest.Mocked<App>;
  let settings: KindleImportPluginSettings;
  let notebook: BookHighlights;

  beforeEach(() => {
    app = jest.mocked<App>({
      vault: {
        getAbstractFileByPath: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as App);

    settings = {
      notebooksLocation: "imports",
      exportLocation: "exports",
      queryGoodreads: false,
      goodreadsUserID: undefined,
    };

    notebook = {
      title: "Sample Book",
      authors: ["Sample Author"],
      chapterHighlights: [
        {
          chapterName: "Chapter 1",
          highlights: [
            {
              text: "Highlight 1",
              type: "quote",
              pageNumber: 1,
            },
            {
              text: "Highlight 2",
              type: "note",
              pageNumber: 2,
            },
          ],
        },
        {
          chapterName: "Chapter 2",
          highlights: [
            {
              text: "Highlight 3",
              type: "quote",
              pageNumber: 3,
            },
          ],
        },
      ],
    };
  });

  test("creates a markdown file with book highlights", async () => {
    app.vault.getAbstractFileByPath.mockReturnValue(null);
    await exportToMarkdown(notebook, app, settings);

    const expectedPath = "exports/Sample Book.md";
    expect(app.vault.create).toHaveBeenCalledWith(expectedPath, expect.any(String));
  });

  test("adds Goodreads link if enabled", async () => {
    settings.queryGoodreads = true;
    settings.goodreadsUserID = "12345";
    const goodreadsBookId = "67890";

    const mockQueryGoodreadsForBookID = jest.mocked(queryGoodreadsForBookID);
    mockQueryGoodreadsForBookID.mockResolvedValue(goodreadsBookId);

    app.vault.getAbstractFileByPath.mockReturnValue(null);

    await exportToMarkdown(notebook, app, settings);

    const expectedPath = "exports/Sample Book.md";
    expect(app.vault.create).toHaveBeenCalledWith(
      expectedPath,
      expect.stringContaining(`https://www.goodreads.com/book/show/${goodreadsBookId}`),
    );
  });

  test("handles existing file", async () => {
    settings.exportLocation = "";
    app.vault.getAbstractFileByPath.mockReturnValue({} as unknown as TAbstractFile);
    await exportToMarkdown(notebook, app, settings);

    expect(app.vault.create).not.toHaveBeenCalled();
  });

  test("shows notice when Goodreads ID missing", async () => {
    settings.queryGoodreads = true;
    const mockQueryGoodreadsForBookID = jest.mocked(queryGoodreadsForBookID);
    mockQueryGoodreadsForBookID.mockResolvedValue(undefined);

    app.vault.getAbstractFileByPath.mockReturnValue(null);

    await exportToMarkdown(notebook, app, settings);

    expect(app.vault.create).toHaveBeenCalled();
  });

  test("handles colon in book title", async () => {
    notebook.title = "Sample Book: A Tale";
    app.vault.getAbstractFileByPath.mockReturnValue(null);
    await exportToMarkdown(notebook, app, settings);

    const expectedPath = "exports/Sample Book.md";
    expect(app.vault.create).toHaveBeenCalledWith(expectedPath, expect.any(String));
  });

  test("formats quote without page number", async () => {
    notebook.chapterHighlights[0].highlights.push({ text: "Highlight 4", type: "quote" });
    app.vault.getAbstractFileByPath.mockReturnValue(null);
    await exportToMarkdown(notebook, app, settings);

    const md = app.vault.create.mock.calls[0][1] as string;
    expect(md).toContain("> [!quote] Quote\nHighlight 4");
  });

  test("throws for invalid highlight type", async () => {
    // @ts-expect-error
    notebook.chapterHighlights[0].highlights.push({ text: "Bad", type: "bad" });
    app.vault.getAbstractFileByPath.mockReturnValue(null);
    await expect(exportToMarkdown(notebook, app, settings)).rejects.toThrow("Invalid highlight type");
  });

  test("MD file starts with expected metadata", async () => {
    notebook.title = "Sample Book: A Tale";
    notebook.authors = ["Ima Writer", "Al Gorithm"];

    app.vault.getAbstractFileByPath.mockReturnValue(null);
    await exportToMarkdown(notebook, app, settings);

    const content = app.vault.create.mock.calls[0][1] as string;
    expect(content).toMatch(
      /^---\ntags:\n\s{2}- books\ntitle: Sample Book: A Tale\nauthor:\n\s{2}- Ima Writer\n\s{2}- Al Gorithm\n---/,
    );
  });
});
