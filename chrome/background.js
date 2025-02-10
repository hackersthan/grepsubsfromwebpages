chrome.webNavigation.onCompleted.addListener(details => {
  if (details.url.startsWith("chrome://") || details.url.startsWith("https://chrome.google.com/webstore")) {
    return;
  }
  
  chrome.storage.local.get(["enabled", "domain", "subdomains"], (data) => {
    if (!data.enabled || !data.domain) return;
    
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      function: extractSubdomains,
      args: [data.domain]
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.warn("Script execution failed:", chrome.runtime.lastError.message);
        return;
      }
      
      if (results && results[0] && results[0].result) {
        let storedSubdomains = new Set(data.subdomains || []);
        results[0].result.forEach(sub => storedSubdomains.add(sub));
        chrome.storage.local.set({ subdomains: [...storedSubdomains] });
      }
    });
  });
});

function extractSubdomains(domain) {
  const regex = new RegExp(`(?:[a-zA-Z0-9-]+\\.)+${domain.replace(/\\./g, "\\.")}`, "gi");
  return [...new Set([...document.documentElement.innerHTML.matchAll(regex)].map(m => m[0].replace(/^\/\//, "")))];
}