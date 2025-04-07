# Model Viewer Quick Look

A tool that combines a Chrome extension with native macOS integration to download USDZ/Reality files from `<model-viewer>` elements on web pages and preview them in macOS Quick Look.

## Features

- Detects 3D model files (.glb, .usdz, .reality) from `<model-viewer>` elements on web pages
- Downloads files with a single click
- Direct preview of USDZ and Reality files in Quick Look on macOS
- File access via context menu (right-click)

## Installation

### 1. Native Host Setup (macOS only)

```bash
# Copy shell script
sudo cp macos-native/usdz-viewer.sh /usr/local/bin/usdz-viewer.sh

# Grant execution permissions
sudo chmod +x /usr/local/bin/usdz-viewer.sh   

# Set up Native Messaging Host manifest
sudo mkdir -p /Library/Google/Chrome/NativeMessagingHosts/
sudo cp macos-native/com.usdz.viewer.json /Library/Google/Chrome/NativeMessagingHosts/
```

Note: Replace `{Google Extension ID}` in the `com.usdz.viewer.json` file with your actual extension ID.

### 2. Chrome Extension Installation

1. Open Chrome extensions management page (`chrome://extensions/`)
2. Enable Developer mode
3. Click "Load unpacked extension"
4. Select the `model-viewer-quicklook` folder

## Usage

1. Click the extension icon on a webpage containing `<model-viewer>` elements
2. A list of detected 3D model files will be displayed
3. Click "Download" button to download files
4. On macOS, click "Quick Look" button to launch macOS Quick Look preview

Alternatively, right-click on the page and select "Quick Look model-viewer files" or "Download model-viewer files".

## Project Structure

- `model-viewer-quicklook/`: Chrome extension files
- `macos-native/`: Native messaging host files for macOS

## Supported File Formats

- GLB (.glb) - Download only
- USDZ (.usdz) - Download and Quick Look
- Reality (.reality) - Download and Quick Look