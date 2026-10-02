(function () {
  "use strict";

  const CARD_ID_PREFIX = "app-";

  const grid = document.getElementById("grid");
  const toast = document.getElementById("toast");
  let toastTimer;

  function el(tag, props, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "onclick") node.addEventListener("click", value);
      else node.setAttribute(key, value);
    }
    for (const child of children || []) {
      if (child) node.append(child);
    }
    return node;
  }

  function externalLink(className, label, url) {
    return el("a", { class: className, href: url, target: "_blank", rel: "noopener", text: label });
  }

  // GitHub の URL ならリポジトリ名、それ以外はドメイン名をアプリ名にする
  function nameFromUrl(url) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parsed.hostname === "github.com" && parts[1]) return parts[1];
      return parsed.hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  }

  function labelFromUrl(url) {
    if (url.includes("apps.apple.com")) return "App Store";
    if (url.includes("play.google.com")) return "Google Play";
    if (/github\.com\/.+\/releases/.test(url)) return "ダウンロード";
    if (url.includes("github.com")) return "GitHub";
    return "開く";
  }

  // apps.js の1件（URL だけの文字列でもよい）を、表示に必要な形にそろえる
  function normalizeApp(entry, index) {
    const app = typeof entry === "string" ? { url: entry } : entry;
    const name = app.name || nameFromUrl(app.url);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return {
      ...app,
      id: slug || String(index + 1),
      name: name,
      label: app.label || labelFromUrl(app.url),
    };
  }

  const apps = APPS.map(normalizeApp);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // clipboard API が使えない環境向け
      const area = el("textarea", { readonly: "", style: "position:fixed;opacity:0" });
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
  }

  async function shareApp(app) {
    const url = location.href.split("#")[0] + "#" + CARD_ID_PREFIX + app.id;
    if (navigator.share) {
      try {
        await navigator.share({ title: app.name, text: app.description || app.name, url: url });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    await copyText(url);
    showToast("リンクをコピーしました");
  }

  function renderSite() {
    document.getElementById("brand-name").textContent = SITE.name;
    document.getElementById("hero-eyebrow").textContent =
      "Apps by " + SITE.author + " — " + String(apps.length).padStart(2, "0");
    document.getElementById("hero-title").textContent = SITE.headline;
    document.getElementById("hero-bio").textContent = SITE.bio;
    document.getElementById("copyright").textContent =
      "© " + new Date().getFullYear() + " " + SITE.author;

    const socials = document.getElementById("socials");
    for (const social of SITE.socials || []) {
      socials.append(el("li", null, [externalLink("", social.label, social.url)]));
    }
  }

  function renderIcon(app) {
    if (app.icon) {
      return el("div", { class: "app-icon" }, [el("img", { src: app.icon, alt: "", loading: "lazy" })]);
    }
    return el("div", {
      class: "app-icon is-letter",
      "aria-hidden": "true",
      text: Array.from(app.name)[0].toUpperCase(),
    });
  }

  function renderCard(app) {
    return el("li", { class: "card", id: CARD_ID_PREFIX + app.id }, [
      el("div", { class: "card-top" }, [renderIcon(app), el("h3", { text: app.name })]),
      app.description && el("p", { class: "desc", text: app.description }),
      el("div", { class: "actions" }, [
        externalLink("btn primary", app.label, app.url),
        el("button", {
          class: "btn share",
          type: "button",
          "aria-label": app.name + " を共有",
          text: "共有",
          onclick: () => shareApp(app),
        }),
      ]),
    ]);
  }

  function renderGrid() {
    grid.replaceChildren(...apps.map(renderCard));
    if (apps.length === 0) {
      grid.append(el("li", { class: "empty", text: "まだアプリがありません。" }));
    }
  }

  // …/#app-◯◯ で開かれたら、そのアプリまでスクロールして目立たせる
  function focusFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!apps.some((app) => CARD_ID_PREFIX + app.id === id)) return;
    const card = document.getElementById(id);
    card.scrollIntoView({ block: "center" });
    card.classList.add("is-target");
    setTimeout(() => card.classList.remove("is-target"), 2600);
  }

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });

  document.getElementById("back-to-top").addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0 });
  });

  renderSite();
  renderGrid();
  focusFromHash();
  window.addEventListener("hashchange", focusFromHash);
})();
