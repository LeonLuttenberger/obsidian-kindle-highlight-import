import { kindleHTMLParser } from "../../src/processing/parser";
import { BookHighlights } from "../../src/processing/parser";

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
`

describe("Parser", () => {

 test("should parse Kindle highlights correctly", () => {
    
    const bookHighlights: BookHighlights = kindleHTMLParser(htmlString);

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

});
