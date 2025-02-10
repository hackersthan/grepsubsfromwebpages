document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");
  const domainInput = document.getElementById("domainInput");
  const copyButton = document.getElementById("copyButton");
  const saveButton = document.getElementById("saveButton");
  const clearButton = document.getElementById("clearButton");
  const subdomainList = document.getElementById("subdomainList");
  const subdomainCount = document.getElementById("subdomainCount");
  
  function updateSubdomainUI() {
    chrome.storage.local.get("subdomains", (data) => {
      const subdomains = data.subdomains || [];
      subdomainList.innerHTML = "";
      subdomains.forEach(sub => {
        const li = document.createElement("li");
        li.textContent = sub;
        subdomainList.appendChild(li);
      });
      subdomainCount.textContent = subdomains.length;
    });
  }
  
  chrome.storage.local.get(["enabled", "domain", "subdomains"], (data) => {
    if (data.enabled) toggleButton.textContent = "Disable";
    if (data.domain) domainInput.value = data.domain;
    updateSubdomainUI();
  });

  toggleButton.addEventListener("click", () => {
    chrome.storage.local.get("enabled", (data) => {
      const newState = !data.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        toggleButton.textContent = newState ? "Disable" : "Enable";
      });
    });
  });

  domainInput.addEventListener("input", () => {
    chrome.storage.local.get(["domain", "subdomains"], (data) => {
      const newDomain = domainInput.value.trim();
      if (data.domain !== newDomain) {
        chrome.storage.local.set({ domain: newDomain, subdomains: [] }, updateSubdomainUI);
      }
    });
  });

  copyButton.addEventListener("click", () => {
    chrome.storage.local.get("subdomains", (data) => {
      navigator.clipboard.writeText((data.subdomains || []).join("\n"));
    });
  });

  saveButton.addEventListener("click", () => {
    chrome.storage.local.get(["subdomains", "domain"], (data) => {
      const domainName = data.domain || "subdomains";
      const filename = `${domainName}-grepsubs.txt`;
      const blob = new Blob([(data.subdomains || []).join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url, filename });
    });
  });

  clearButton.addEventListener("click", () => {
    chrome.storage.local.set({ subdomains: [] }, updateSubdomainUI);
  });

  chrome.storage.onChanged.addListener(updateSubdomainUI);
});