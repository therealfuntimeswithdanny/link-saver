// Retrieve saved links from localStorage or return an empty array if none exist.
// Each saved link is an object: { id, url, pinned }
function getLinks() {
  const links = localStorage.getItem("savedLinks");
  return links ? JSON.parse(links) : [];
}

// Save the links array to localStorage.
function saveLinks(links) {
  localStorage.setItem("savedLinks", JSON.stringify(links));
}

// Render the links to the webpage, with pinned links sorted to the top.
function renderLinks() {
  const linkList = document.getElementById("linkList");
  linkList.innerHTML = "";
  const links = getLinks();

  // Sort links so that pinned ones come first.
  const sortedLinks = [...links].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );

  sortedLinks.forEach(link => {
    const li = document.createElement("li");
    if (link.pinned) {
      li.classList.add("pinned");
    }
    
    // Create anchor element for the link.
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.textContent = link.url;
    li.appendChild(anchor);
    
    // Container for action buttons.
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

// Handle submission of a new link.
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

// Toggle dark mode and save the preference.
document.getElementById("darkModeToggle").addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);
});

// Apply saved dark mode preference on load.
function applyDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// AUTO-ADD LINK FROM URL QUERY PARAMETERS
function autoAddLinkFromURL() {
  // Check if there's a query string in the current URL.
  if (window.location.search) {
    // Remove the leading '?' and decode the string.
    let query = decodeURIComponent(window.location.search.substring(1));
    if (query) {
      // Format the URL (add protocol if missing).
      const formattedLink = formatURL(query);
      const links = getLinks();
      // If it isn't already saved, push it.
      if (!links.find(item => item.url === formattedLink)) {
        links.push({ id: Date.now(), url: formattedLink, pinned: false });
        saveLinks(links);
        renderLinks();
      }
      // Remove the query string from the URL so it doesn't re-add on refresh.
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }
}

// INITIALIZE THE APP
applyDarkMode();
autoAddLinkFromURL();
renderLinks();
