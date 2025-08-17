# Kindle Highlight Import

[![Build and Test Project](https://github.com/LeonLuttenberger/obsidian-kindle-highlight-import/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/LeonLuttenberger/obsidian-kindle-highlight-import/actions/workflows/build-and-test.yml)
[![pre-commit.ci status](https://results.pre-commit.ci/badge/github/LeonLuttenberger/obsidian-kindle-highlight-import/main.svg)](https://results.pre-commit.ci/latest/github/LeonLuttenberger/obsidian-kindle-highlight-import/main)
[![codecov](https://codecov.io/gh/LeonLuttenberger/obsidian-kindle-highlight-import/graph/badge.svg?token=8MYD657APX)](https://codecov.io/gh/LeonLuttenberger/obsidian-kindle-highlight-import)

This project is a plugin for [Obsidian](https://obsidian.md/) that allows users to import Kindle highlights into their Obsidian vault. It helps organize and manage your Kindle highlights seamlessly within your Obsidian notes.

## Features

- Import Kindle highlights directly into Obsidian.
- Automatically format highlights for easy readability.

## Installation

### From Obsidian

1. Open Obsidian and go to **Settings → Community plugins → Browse**.
2. Search for "Kindle Highlight Import" and install it.
3. Enable the plugin.

### Manual installation

1. Download the latest release from the [Releases](https://github.com/LeonLuttenberger/obsidian-kindle-highlight-import/releases) page.
2. Extract the downloaded archive.
3. Copy the extracted folder to your Obsidian plugins folder:
   ```bash
   cp -r /path/to/extracted/folder /path/to/your/obsidian/vault/.obsidian/plugins/kindle-highlight-import
   ```

## Usage

1. Export your Kindle notebook: open the Kindle app, go into your highlights, choose **Share**, select **None** as the citation style, and email the file to yourself.
   - Note: PDF exports created directly from a Kindle device are also supported, but they do not include chapter titles. For best results, exporting from the Kindle app on iOS or Android is recommended.
2. In Obsidian, use one of the plugin commands to import the notebook:
   - **Import Kindle notebook with file picker** to choose the exported file from your device.
   - **Import Kindle notebook from vault** to select an exported file already stored in your vault.

### Configuration

Adjust the plugin's settings in **Settings → Kindle Highlight Import** to customize its behavior:

- **Notebook location** – path in your vault where Kindle notebook HTML exports are stored. This is used by the *Import Kindle notebook from vault* command.
- **Book notes location** – folder where generated Markdown notes are saved. If left empty, notes are created at the vault root.
- **Query Goodreads** – when enabled, the plugin searches Goodreads for the book and adds a link to the page in the exported note.
- **Goodreads user ID** – optional ID used to link your own Kindle notes on Goodreads; only relevant if Goodreads querying is enabled.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
