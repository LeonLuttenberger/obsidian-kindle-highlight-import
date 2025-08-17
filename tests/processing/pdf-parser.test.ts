import { parseKindlePdf } from "../../src/processing/parser/pdf-parser";

const pages = [
  [
    "Sample Book",
    "by Doe, John; Doe, Jane",
    "",
    "Highlight (yellow) and Note | Page 1",
    "",
    "First highlight text",
    "",
  ],
  ["first note", "Highlight (yellow) | Page 2", "", "Second highlight text", ""],
];

jest.mock("obsidian", () => ({
  loadPdfJs: async () => ({
    getDocument: (_src: ArrayBuffer | { data: ArrayBuffer }) => ({
      promise: Promise.resolve({
        numPages: 2,
        getPage: async (n: number) => ({
          getTextContent: async () => ({
            items: pages[n - 1].map((item) => ({ str: item })),
          }),
        }),
      }),
    }),
  }),
}));

describe("KindlePDFParser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mock("obsidian");
  });

  test("parses highlights from PDF", async () => {
    const parsed = await parseKindlePdf(new ArrayBuffer(0));

    expect(parsed.title).toBe("Sample Book");
    expect(parsed.authors).toEqual(["John Doe", "Jane Doe"]);
    expect(parsed.chapterHighlights).toHaveLength(1);
    const chapter = parsed.chapterHighlights[0];
    expect(chapter.highlights).toHaveLength(3);
    expect(chapter.highlights[0]).toEqual({ text: "First highlight text", pageNumber: 1, type: "quote" });
    expect(chapter.highlights[1]).toEqual({ text: "first note", pageNumber: 1, type: "note" });
    expect(chapter.highlights[2]).toEqual({ text: "Second highlight text", pageNumber: 2, type: "quote" });
  });

  test("throws error if no author found", async () => {
    pages[0][1] = ""; // Remove authors
    await expect(parseKindlePdf(new ArrayBuffer(0))).rejects.toThrow("No author found in PDF text");
  });
});
