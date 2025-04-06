chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.getPlatformInfo((info) => {
    if (info.os === "mac") {
      chrome.contextMenus.create({
        id: "download-model-viewer-files",
        title: "model-viewerのファイルをQuick Look",
        contexts: ["page"],
      });
    }
  });
  chrome.contextMenus.create({
    id: "download-model-viewer-files-download",
    title: "model-viewerのファイルをダウンロード",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "download-model-viewer-files") {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const urls = [];
        document.querySelectorAll("model-viewer").forEach((el) => {
          const srcUrl = new URL(el.getAttribute("ios-src"))
          const src = `https://${srcUrl.host}${
            srcUrl.pathname
          }`;
          urls.push(src);
        });
        return Array.from(new Set(urls));
      },
    });

    const urls = results[0]?.result || [];

    if (urls.length > 0) {
      const port = chrome.runtime.connectNative("com.usdz.viewer");
      port.postMessage({ url: urls[0] });
      setTimeout(() => {
        port.disconnect();
      }, 1000);
    }
  } else if (info.menuItemId === "download-model-viewer-files-download") {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const urls = [];
        document.querySelectorAll("model-viewer").forEach((el) => {
            const srcUrl = new URL(el.getAttribute("src"));
            const src = `https://${srcUrl.host}${srcUrl.pathname}`;
            urls.push(src);

            const iosSrcUrl = el.getAttribute("ios-src");
            if (iosSrcUrl) {
            const iosSrc = new URL(iosSrcUrl);
            urls.push(`https://${iosSrc.host}${iosSrc.pathname}`);
            }
        });
        return Array.from(new Set(urls));
      },
    });

    const urls = results[0]?.result || [];
    if (urls.length > 0) {
      urls.forEach((url) => {
        chrome.downloads.download({ url });
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[background.js] メッセージ受信:", message);

  if (message.action === "quicklook" && message.url) {
    try {
      const port = chrome.runtime.connectNative("com.usdz.viewer");
      console.log("[background.js] ネイティブメッセージング接続成功");

      port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          console.error(
            "[background.js] ネイティブ切断時エラー:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("[background.js] ネイティブ接続終了");
        }
      });

      port.onMessage.addListener((msg) => {
        console.log("[background.js] ネイティブからの応答:", msg);
      });

      port.postMessage({ url: message.url });
      console.log("[background.js] ネイティブへURL送信:", message.url);
      setTimeout(() => {
        port.disconnect();
      }, 1000);

      sendResponse({ status: "ok" });
    } catch (e) {
      console.error("[background.js] ネイティブメッセージング失敗:", e);
      sendResponse({ status: "error", message: e.message });
    }
  }

  return true;
});
