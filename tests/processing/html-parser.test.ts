import type { BookHighlights } from "../../src/processing/model";
import { parseKindleHtml } from "../../src/processing/parser/html-parser";

const htmlString = `
<html>
<body>

<div class="bookTitle">
    Armageddon Averted: The Soviet Collapse, 1970-2000
</div>
<div class="authors">
    Kotkin, Stephen
</div>

<div class="sectionHeading">
    Introduction
</div>

<div class="noteHeading">
    Highlight(<span class="highlight_yellow">yellow</span>) - Page 20 · Location 173
</div>
<div class="noteText">
    First quote.
</div>

<div class="noteHeading">
    Highlight(<span class="highlight_yellow">yellow</span>) - Page 23 · Location 202
</div>
<div class="noteText">
    Second quote.
</div>

<div class="sectionHeading">
    1 History's Cruel Tricks
</div>

<div class="noteHeading">
    Highlight(<span class="highlight_yellow">yellow</span>) - Page 28 · Location 264
</div>
<div class="noteText">
    Third quote.
</div>
<div class="noteHeading">
    Page 28 · Location 264
</div>
<div class="noteText">
    First note.
</div>

</body>
</html>
`;

describe("Parser", () => {
  test("should parse Kindle highlights correctly", () => {
    const bookHighlights: BookHighlights = parseKindleHtml(htmlString);

    expect(bookHighlights.title).toBe("Armageddon Averted: The Soviet Collapse, 1970-2000");
    expect(bookHighlights.authors).toEqual(["Stephen Kotkin"]);

    const chapterHighlights = bookHighlights.chapterHighlights;
    expect(chapterHighlights.length).toBe(2);

    expect(chapterHighlights[0].chapterName).toBe("Introduction");
    expect(chapterHighlights[0].highlights.length).toBe(2);

    expect(chapterHighlights[0].highlights[0].text).toBe("First quote.");
    expect(chapterHighlights[0].highlights[0].type).toBe("quote");
    expect(chapterHighlights[0].highlights[0].pageNumber).toBe(20);

    expect(chapterHighlights[0].highlights[1].text).toBe("Second quote.");
    expect(chapterHighlights[0].highlights[1].type).toBe("quote");
    expect(chapterHighlights[0].highlights[1].pageNumber).toBe(23);

    expect(chapterHighlights[1].chapterName).toBe("1 History's Cruel Tricks");
    expect(chapterHighlights[1].highlights.length).toBe(2);

    expect(chapterHighlights[1].highlights[0].text).toBe("Third quote.");
    expect(chapterHighlights[1].highlights[0].type).toBe("quote");
    expect(chapterHighlights[1].highlights[0].pageNumber).toBe(28);

    expect(chapterHighlights[1].highlights[1].text).toBe("First note.");
    expect(chapterHighlights[1].highlights[1].type).toBe("note");
    expect(chapterHighlights[1].highlights[1].pageNumber).toBe(28);
  });
  test("returns section title when present", () => {
    const htmlString = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading">Chapter</div>
        <div class="noteHeading">Highlight - Section Title > Location 10</div>
        <div class="noteText">Quote</div>
      </body></html>`;

    const parsed = parseKindleHtml(htmlString);
    expect(parsed.chapterHighlights[0].highlights[0].sectionTitle).toBe('Section Title');
  });

  test("returns location when present", () => {
    const htmlString = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading">Chapter</div>
        <div class="noteHeading">Highlight . Location 10</div>
        <div class="noteText">Quote</div>
      </body></html>`;

    const parsed = parseKindleHtml(htmlString);
    expect(parsed.chapterHighlights[0].highlights[0].location).toBe(10);
  });
  test("throws when required elements missing", () => {
    const badHtml = `<html><body><div class="authors">Author</div></body></html>`;
    expect(() => parseKindleHtml(badHtml)).toThrow("bookTitle");
  });

  test("throws when note heading missing", () => {
    const badHtml = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading">Chapter</div>
        <div class="noteText">Text</div>
      </body></html>`;
    expect(() => parseKindleHtml(badHtml)).toThrow("Note heading");
  });

  test("throws when previous note heading absent", () => {
    const badHtml = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading">Chapter</div>
        <div><div class="noteText">Text</div></div>
      </body></html>`;
    expect(() => parseKindleHtml(badHtml)).toThrow("Note heading is empty or not found");
  });

  test("returns undefined page number when not present", () => {
    const noPageHtml = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading">Chapter</div>
        <div class="noteHeading">Highlight - Location 10</div>
        <div class="noteText">Quote</div>
      </body></html>`;

    const parsed = parseKindleHtml(noPageHtml);
    expect(parsed.chapterHighlights[0].highlights[0].pageNumber).toBeUndefined();
  });

  test("throws when book title empty", () => {
    const badHtml = `
      <html><body>
        <div class="bookTitle"></div>
        <div class="authors">Author</div>
      </body></html>`;
    expect(() => parseKindleHtml(badHtml)).toThrow("is empty");
  });

  test("throws when chapter name empty", () => {
    const badHtml = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading"></div>
        <div class="noteHeading">Highlight - Page 1</div>
        <div class="noteText">Text</div>
      </body></html>`;
    expect(() => parseKindleHtml(badHtml)).toThrow("Chapter name is empty");
  });

  test("throws when note text empty", () => {
    const badHtml = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Author</div>
        <div class="sectionHeading">Chapter</div>
        <div class="noteHeading">Highlight - Page 1</div>
        <div class="noteText"></div>
      </body></html>`;
    expect(() => parseKindleHtml(badHtml)).toThrow("Note text is empty");
  });

  test("keeps author order when name has multiple commas", () => {
    const html = `
      <html><body>
        <div class="bookTitle">Title</div>
        <div class="authors">Doe, John, Jr.</div>
        <div class="sectionHeading">Chapter</div>
        <div class="noteHeading">Highlight - Page 1</div>
        <div class="noteText">Text</div>
      </body></html>`;
    const parsed = parseKindleHtml(html);
    expect(parsed.authors).toEqual(["Doe, John, Jr."]);
  });
});
