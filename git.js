
const input = document.getElementById("search-input");
const btn = document.getElementById("search-btn");

const hero = document.getElementById("hero-section");

const msgSection = document.getElementById("message-section");
const msgWelcome = document.getElementById("msg-welcome");
const msgLoading = document.getElementById("msg-loading");
const msgError = document.getElementById("msg-error");

const profileSection = document.getElementById("profile-section");

const avatar = document.getElementById("profile-avatar");
const nameEl = document.getElementById("profile-name");
const loginEl = document.getElementById("profile-login");
const bioEl = document.getElementById("profile-bio");
const followersEl = document.getElementById("profile-followers");
const reposEl = document.getElementById("profile-repos");
const profileLink = document.getElementById("profile-link");
const bookmarkBtn = document.getElementById("btn-bookmark");

const bookmarksSection = document.getElementById("bookmarks-section");
const bookmarksBadge = document.querySelector(".badge");
const bookmarksBtn = document.querySelector(".btn-bookmarks");



let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
let bookmarksVisible = false;

updateBookmarksUI();



async function fetchUser(username) {
    const res = await fetch(`https://api.github.com/users/${username}`);
    return await res.json();
}


// ============================
// SEARCH
// ============================
btn.addEventListener("click", searchUser);

async function searchUser() {
    const username = input.value.trim();
    if (!username) return;

    hero.classList.add("hidden");
    hideProfile();
    showMessage("loading");

    const data = await fetchUser(username);

    if (data.message === "Not Found") {
        showMessage("error", "Utilisateur introuvable !");
        return;
    }

    hideMessages();
    fillProfile(data);
    showProfile();
}


// ============================
// PROFILE
// ============================
function fillProfile(data) {
    avatar.src = data.avatar_url;
    nameEl.textContent = data.name || "No name";
    loginEl.textContent = "@" + data.login;
    bioEl.textContent = data.bio || "No bio";
    followersEl.textContent = data.followers;
    reposEl.textContent = data.public_repos;
    profileLink.href = data.html_url;

    bookmarkBtn.onclick = function () {
        addBookmark(data.login, data.avatar_url);

        this.textContent = "Ajouté ✓";
        this.disabled = true;

        setTimeout(() => {
            this.textContent = "Ajouter aux favoris";
            this.disabled = false;
        }, 1500);
    };
}


// ============================
// ADD BOOKMARK
// ============================
function addBookmark(username, avatarUrl) {
    if (bookmarks.some(b => b.username === username)) return;

    bookmarks.push({ username, avatarUrl });

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    updateBookmarksUI();
}


// ============================
// REMOVE BOOKMARK
// ============================
function removeBookmark(username) {
    bookmarks = bookmarks.filter(b => b.username !== username);

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    updateBookmarksUI();
}


// ============================
// TOGGLE BOOKMARKS
// ============================
bookmarksBtn.addEventListener("click", toggleBookmarks);

function toggleBookmarks() {
    bookmarksVisible = !bookmarksVisible;

    if (bookmarksVisible) {
        bookmarksSection.classList.remove("hidden");
    } else {
        bookmarksSection.classList.add("hidden");
    }
}


// ============================
// UPDATE UI
// ============================
function updateBookmarksUI() {
    const emptyMsg = bookmarksSection.querySelector(".empty-msg");

    bookmarksBadge.textContent = bookmarks.length;

    document.querySelectorAll(".bm-item").forEach(el => el.remove());

    if (bookmarks.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";

    bookmarks.forEach(bm => {
        const item = document.createElement("div");
        item.className = "bm-item";

        item.style = `
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:10px;
            margin-bottom:10px;
            background:#1e293b;
            border:1px solid #334155;
            border-radius:10px;
        `;

        item.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <img src="${bm.avatarUrl}" width="40" style="border-radius:50%">
                <strong>@${bm.username}</strong>
            </div>

            <div>
                <a href="https://github.com/${bm.username}" target="_blank" style="color:#38bdf8; margin-right:10px;">
                    Voir ↗
                </a>

                <button onclick="removeBookmark('${bm.username}')">
                    ❌
                </button>
            </div>
        `;

        bookmarksSection.appendChild(item);
    });
}


// ============================
// UI HELPERS
// ============================
function showMessage(type, text = "") {
    msgWelcome.classList.add("hidden");
    msgLoading.classList.add("hidden");
    msgError.classList.add("hidden");

    if (type === "loading") {
        msgSection.classList.remove("hidden");
        msgLoading.classList.remove("hidden");
    }

    if (type === "error") {
        msgSection.classList.remove("hidden");
        document.getElementById("error-text").textContent = text;
        msgError.classList.remove("hidden");
    }

    if (type === "welcome") {
        msgSection.classList.remove("hidden");
        msgWelcome.classList.remove("hidden");
    }
}

function hideMessages() {
    msgSection.classList.add("hidden");
}

function showProfile() {
    profileSection.classList.remove("hidden");
}

function hideProfile() {
    profileSection.classList.add("hidden");
}