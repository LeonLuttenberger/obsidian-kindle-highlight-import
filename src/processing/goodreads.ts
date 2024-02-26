import { requestUrl } from "obsidian";

function getBookID(text: string): string {
  const matches = text.match("\\/book\\/show\\/([A-Za-z0-9\\-]+)\\?.*");
  if (matches) {
    return matches[1];
  }
  throw new Error("No book ID found in text: " + text);
}

export async function queryGoodreadsForBookID(bookTitle: string, authors: string[]): Promise<string | undefined> {
  const encodedQuery = encodeURIComponent(bookTitle + " " + authors.join(" "));
  const url = `https://www.goodreads.com/search?q=${encodedQuery}`;

  const response = await requestUrl({ url: url });

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(response.text, "text/html");

  const elements = htmlDoc.getElementsByClassName("bookTitle");
  if (elements.length == 0) {
    return undefined;
  }

  const elementHref = elements[0].getAttr("href");
  if (!elementHref) {
    return undefined;
  }

  return getBookID(elementHref);
}
