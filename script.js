// Retrieve saved links from localStorage or return an empty array if none exist.
// Each saved link is an object: { id, url, pinned }
function getLinks() {
  const stored = localStorage.getItem("savedLinks");
  return stored ? JSON.parse(stored) : [];
}

// Save the links array back to localStorage.
function saveLinks(links) {
  localStorage.setItem("savedLinks", JSON.stringify(links));
}

// Render links from localStorage to the webpage.
// Pinned links will appear first.
function renderLinks() {
  const linkList = document.getElementById("linkList");
  linkList.innerHTML = "";
  const links = getLinks();

  // Sort links so that pinned links come first.
  const sortedLinks = [...links].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );

  sortedLinks.forEach(link => {
    const li = document.createElement("li");
    if (link.pinned) {
      li.classList.add("pinned");
    }

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.textContent = link.url;
    li.appendChild(anchor);

    // Create a group for action buttons.
    const btnGroup = document.createElement("div");
    btnGroup.classList.add("button-group");

    // Pin/Unpin button.
    const pinButton = document.createElement("button");
    pinButton.textContent = link.pinned ? "Unpin" : "Pin";
    pinButton.classList.add("pin-button");
    pinButton.addEventListener("click", () => {
      const linksArr = getLinks();
      const index = linksArr.findIndex(item => item.id === link.id);
      if (index !== -1) {
        linksArr[index].pinned = !linksArr[index].pinned;
        saveLinks(linksArr);
        renderLinks();
      }
    });
    btnGroup.appendChild(pinButton);

    // Delete button.
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      const linksArr = getLinks();
      const index = linksArr.findIndex(item => item.id === link.id);
      if (index !== -1) {
        linksArr.splice(index, 1);
        saveLinks(linksArr);
        renderLinks();
      }
    });
    btnGroup.appendChild(deleteButton);

    li.appendChild(btnGroup);
    linkList.appendChild(li);
  });
}

// Ensure the URL has a valid protocol.
function formatURL(url) {
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  return url;
}

// Handle form submission to add a new link.
document.getElementById("linkForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const linkInput = document.getElementById("linkInput");
  let url = linkInput.value;
  if (url) {
    url = formatURL(url);
    const links = getLinks();
    // Avoid duplicates.
    if (!links.find(item => item.url === url)) {
      links.push({ id: Date.now(), url: url, pinned: false });
      saveLinks(links);
      renderLinks();
    }
    linkInput.value = "";
  }
});

// Delete All Links functionality.
document.getElementById("deleteAllButton").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all links?")) {
    localStorage.removeItem("savedLinks");
    renderLinks();
  }
});

// Auto-add a link from the query string.
function autoAddLinkFromURL() {
  if (window.location.search) {
    let query = decodeURIComponent(window.location.search.substring(1));
    if (query) {
      query = formatURL(query);
      const links = getLinks();
      if (!links.find(item => item.url === query)) {
        links.push({ id: Date.now(), url: query, pinned: false });
        saveLinks(links);
        renderLinks();
      }
      // Remove query string from URL.
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }
}

// DARK MODE FUNCTIONALITY

// Get dark mode preference from localStorage.
function loadDarkModePreference() {
  return localStorage.getItem("darkMode") === "true";
}

// Save dark mode preference to localStorage.
function saveDarkModePreference(isDark) {
  localStorage.setItem("darkMode", isDark);
}

// Apply dark mode based on the saved preference.
function applyDarkMode() {
  if (loadDarkModePreference()) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// Toggle dark mode when the button is clicked.
document.getElementById("darkModeToggle").addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  saveDarkModePreference(isDark);
});

// INITIALIZE APP
applyDarkMode();
renderLinks();
autoAddLinkFromURL();
