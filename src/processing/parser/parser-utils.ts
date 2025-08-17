function processAuthorName(text: string): string {
  if (text.includes(",")) {
    const nameComponents = text.split(",");

    if (nameComponents.length === 2) {
      return `${nameComponents[1].trim()} ${nameComponents[0].trim()}`;
    }
  }

  return text;
}

export function parseAuthors(text: string): string[] {
  return text.split(";").map(processAuthorName);
}
