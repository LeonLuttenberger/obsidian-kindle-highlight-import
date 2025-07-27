export const App = jest.fn();
export const TFile = jest.fn();
export const TFolder = jest.fn();
export const Notice = jest.fn();
export class Vault {
  getAbstractFileByPath = jest.fn();
  create = jest.fn();
  getFiles = jest.fn();
  cachedRead = jest.fn();
  getAllFolders = jest.fn();
}

export class Modal {
  app: unknown;
  contentEl: HTMLElement;
  modalEl: HTMLElement;
  constructor(app: unknown) {
    this.app = app;
    this.contentEl = document.createElement("div");
    this.modalEl = document.createElement("div");
  }
  open() {}
  close() {}
}

export class SuggestModal<T> extends Modal {
  getSuggestions(_query: string): T[] {
    return [] as T[];
  }
  renderSuggestion(_value: T, _el: HTMLElement) {}
  onChooseSuggestion(_value: T, _evt: MouseEvent | KeyboardEvent) {}
}

export class AbstractInputSuggest<_T> {
  app: unknown;
  inputEl: HTMLInputElement;
  constructor(app: unknown, inputEl: HTMLInputElement) {
    this.app = app;
    this.inputEl = inputEl;
  }
  close() {}
}

export const normalizePath = (path: string) => path;
