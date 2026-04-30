

const input = document.getElementById("search-input");
const btn = document.getElementById("search-btn");

const hero = document.getElementById("hero-section");

const msgSection = document.getElementById("message-section");
const msgWelcome = document.getElementById("msg-welcome");
const msgLoading = document.getElementById("msg-loading");
const msgError = document.getElementById("msg-error");
const errorText = document.getElementById("error-text");

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
const badge = document.querySelector(".badge");

const bookmarksToggleBtn = document.querySelector(".btn-bookmarks");


const state = {
    currentUser: null,
    bookmarks: JSON.parse(localStorage.getItem("bookmarks")) || [],
    isViewingBookmarks: false
};


function init() {
    bookmarksSection.style.display = "none";
    msgSection.classList.remove("hidden");
    msgWelcome.classList.remove("hidden");
    updateNavButton();
    updateBookmarksUI();
}
init();


async function fetchUser(username) {
    const res = await fetch(`https://api.github.com/users/${username}`);

    if (res.status === 404) {
        throw new Error(`Utilisateur "${username}" introuvable`);
    }

    if (res.status === 403) {
        throw new Error("Limite API GitHub atteinte.");
    }

    if (!res.ok) {
        throw new Error("Une erreur inattendue s'est produite.");
    }

    return await res.json();
}


btn.addEventListener("click", handleSearch);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

async function handleSearch() {
    const username = input.value.trim();
    if (!username) return;

    try {
        showLoading();

        const user = await fetchUser(username);

        state.currentUser = user;
        state.isViewingBookmarks = false;

        displayProfile(user);
        updateNavButton();

    } catch (err) {
        showError(err.message);
    }
}

function displayProfile(user) {
    hero.classList.add("hidden");
    msgSection.classList.add("hidden");
    profileSection.classList.remove("hidden");

    avatar.src = user.avatar_url;
    nameEl.textContent = user.name || "Nom non renseigné";
    loginEl.textContent = "@" + user.login;
    bioEl.textContent = user.bio || "Aucune bio disponible.";
    followersEl.textContent = user.followers;
    reposEl.textContent = user.public_repos;
    profileLink.href = user.html_url;

    const isBookmarked = state.bookmarks.some(b => b.id === user.id);
    updateBookmarkButton(isBookmarked);

    bookmarkBtn.onclick = () => {
        const exists = state.bookmarks.some(b => b.id === user.id);

        if (exists) {
            removeBookmark(user.id);
            updateBookmarkButton(false);
        } else {
            addBookmark(user);
            updateBookmarkButton(true);
        }
    };
}

function updateBookmarkButton(isActive) {
    bookmarkBtn.textContent = isActive
        ? "✓ Dans les favoris"
        : "Ajouter aux favoris";

    bookmarkBtn.classList.toggle("active", isActive);
}

function addBookmark(user) {
    if (state.bookmarks.some(b => b.id === user.id)) return;

    state.bookmarks.push({
        id: user.id,
        login: user.login,
        avatar: user.avatar_url
    });

    saveBookmarks();
}

function removeBookmark(id) {
    state.bookmarks = state.bookmarks.filter(b => b.id !== id);
    saveBookmarks();

    if (state.currentUser?.id === id) {
        updateBookmarkButton(false);
    }
}

function saveBookmarks() {
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
    updateBookmarksUI();
    updateNavButton();
}


function updateNavButton() {
    const label = state.isViewingBookmarks ? "← Retour" : "Favoris";

    bookmarksToggleBtn.innerHTML = `
        ${label} <span class="badge">${state.bookmarks.length}</span>
    `;
}

bookmarksToggleBtn.addEventListener("click", () => {
    state.isViewingBookmarks = !state.isViewingBookmarks;

    bookmarksSection.style.display = state.isViewingBookmarks ? "block" : "none";

    hero.classList.toggle("hidden", state.isViewingBookmarks);
    msgSection.classList.add("hidden");
    profileSection.classList.add("hidden");

    if (!state.isViewingBookmarks && state.currentUser) {
        displayProfile(state.currentUser);
    }

    updateNavButton();
});

function updateBookmarksUI() {
    badge.textContent = state.bookmarks.length;

    document.querySelectorAll(".bm-item").forEach(el => el.remove());

    state.bookmarks.forEach(bm => {
        const div = document.createElement("div");
        div.className = "bm-item";

        div.innerHTML = `
            <div class="bm-load">
                <img src="${bm.avatar}" width="40">
                <strong>@${bm.login}</strong>
            </div>
            <button class="bm-remove">Retirer❌</button>
        `;

        div.querySelector(".bm-load").addEventListener("click", () => {
            input.value = bm.login;
            state.isViewingBookmarks = false;
            bookmarksSection.style.display = "none";
            handleSearch();
        });

        div.querySelector(".bm-remove").addEventListener("click", (e) => {
            e.stopPropagation();
            removeBookmark(bm.id);
        });

        bookmarksSection.appendChild(div);
    });
}

function showLoading() {
    hero.classList.add("hidden");
    profileSection.classList.add("hidden");

    msgSection.classList.remove("hidden");
    msgLoading.classList.remove("hidden");
    msgError.classList.add("hidden");
}

function showError(message) {
    msgSection.classList.remove("hidden");
    msgError.classList.remove("hidden");
    errorText.textContent = message;

    msgLoading.classList.add("hidden");
}