import { App } from "obsidian";
import { exportToMarkdown } from "../../src/processing/export";
import { queryGoodreadsForBookID } from "../../src/processing/goodreads";
import { BookHighlights } from "../../src/processing/parser";
import { KindleImportPluginSettings } from "../../src/settings/pluginSettings";
import { jest } from "@jest/globals";

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
});
