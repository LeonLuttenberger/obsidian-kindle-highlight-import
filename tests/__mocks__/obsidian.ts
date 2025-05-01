export const App = jest.fn();
export const TFile = jest.fn();
export const Notice = jest.fn();
export const Vault = jest.fn().mockImplementation(() => ({
  getAbstractFileByPath: jest.fn(),
  create: jest.fn(),
}));
