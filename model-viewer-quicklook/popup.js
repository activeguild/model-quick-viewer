function isSupportedFile(url) {
  return url && (url.endsWith('.glb') || url.endsWith('.usdz') || url.endsWith('.reality'));
}

function isQuickLookable(url) {
  return url && (url.endsWith('.usdz') || url.endsWith('.reality'));
}

async function getModelViewerURLs() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const urls = [];
      document.querySelectorAll('model-viewer').forEach(el => {
        const srcUrl = new URL(el.getAttribute("src"))
        const src = `https://${srcUrl.host}${
          srcUrl.pathname
        }`;
        const iosSrcUrl = new URL(el.getAttribute("ios-src"))
        const iosSrc = `https://${iosSrcUrl.host}${
          iosSrcUrl.pathname
        }`;
        if (src && (src.endsWith('.glb') || src.endsWith('.usdz') || src.endsWith('.reality'))) urls.push(src);
        if (iosSrc && (iosSrc.endsWith('.usdz') || iosSrc.endsWith('.reality'))) urls.push(iosSrc);
      });
      return Array.from(new Set(urls));
    }
  });

  return result[0]?.result || [];
}

function createURLElement(url) {
  const div = document.createElement('div');
  div.className = 'url-entry';

  const fileName = url.split('/').pop();
  const span = document.createElement('span');
  span.textContent = fileName;
  span.title = url;

  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.gap = '5px';

  const dlBtn = document.createElement('button');
  dlBtn.textContent = 'ダウンロード';
  dlBtn.onclick = () => chrome.downloads.download({ url });

  buttonGroup.appendChild(dlBtn);

  if (navigator.platform.toLowerCase().includes('mac') && isQuickLookable(url)) {
    const qlBtn = document.createElement('button');
    qlBtn.textContent = 'Quick Look';
    qlBtn.onclick = () => {
      console.log('[popup.js] Quick Lookボタンがクリックされました:', url);
      chrome.runtime.sendMessage({ action: 'quicklook', url }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[popup.js] sendMessageエラー:', chrome.runtime.lastError.message);
        } else {
          console.log('[popup.js] 応答:', response);
        }
      });
    };
    buttonGroup.appendChild(qlBtn);
  }

  div.appendChild(span);
  div.appendChild(buttonGroup);

  return div;
}

(async () => {
  const container = document.getElementById('output');
  container.innerHTML = '';

  const urls = await getModelViewerURLs();
  if (urls.length === 0) {
    container.textContent = '対応ファイルが見つかりませんでした。';
  } else {
    urls.forEach(url => {
      container.appendChild(createURLElement(url));
    });
  }
})();