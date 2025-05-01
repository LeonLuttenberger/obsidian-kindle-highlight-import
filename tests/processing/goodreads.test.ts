import { queryGoodreadsForBookID } from "../../src/processing/goodreads";
import { requestUrl } from "obsidian";

jest.mock("obsidian", () => ({
  requestUrl: jest.fn(),
}));

describe("Goodreads", () => {
  it("should return the book ID when a valid response is received", async () => {
    const mockResponse = {
      text: `
        <html>
          <body>
            <a class="bookTitle" href="/book/show/67890-another-book-title?from_search=true">Book Title</a>
          </body>
        </html>
      `,
    };
    (requestUrl as jest.Mock).mockResolvedValue(mockResponse);

    const bookID = await queryGoodreadsForBookID("Another Book Title", ["Author Name"]);
    expect(bookID).toBe("67890-another-book-title");
  });

  it("should return undefined when no bookTitle elements are found", async () => {
    const mockResponse = {
      text: `
        <html>
          <body>
            <div>No results found</div>
          </body>
        </html>
      `,
    };
    (requestUrl as jest.Mock).mockResolvedValue(mockResponse);

    const bookID = await queryGoodreadsForBookID("Nonexistent Book", ["Unknown Author"]);
    expect(bookID).toBeUndefined();
  });

  it("should return undefined when the bookTitle element has no href attribute", async () => {
    const mockResponse = {
      text: `
        <html>
          <body>
            <a class="bookTitle">Book Title</a>
          </body>
        </html>
      `,
    };
    (requestUrl as jest.Mock).mockResolvedValue(mockResponse);

    const bookID = await queryGoodreadsForBookID("Book Without Href", ["Author Name"]);
    expect(bookID).toBeUndefined();
  });
});
