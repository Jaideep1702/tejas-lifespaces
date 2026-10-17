(() => {
  "use strict";

  const C = window.CONFIG;
  const P = window.PROJECTS;
  const A = window.ABOUT;

  /* ═══════════════ Helpers ═══════════════ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const byId = (id) => P.find((p) => p.id === id);
  const ongoing = P.filter((p) => p.status === "ongoing");
  const where = (p) => `${p.locality}, ${p.city}`;
  const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");
  const lakhs = (n) => (n >= 1e7 ? `₹ ${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr` : `₹ ${(n / 1e5).toFixed(1).replace(/\.0$/, "")} L`);
  const wa = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const mapEmbed = (q, z = 13) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed`;
  const directions = (from, to) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
  const validPhone = (v) => /^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""));

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  };

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  /* ═══════════════ Leads ═══════════════ */
  function saveLead(lead) {
    const record = { ...lead, at: new Date().toISOString(), page: location.href };
    const all = store.get("tejas_leads", []);
    all.push(record);
    store.set("tejas_leads", all);
    store.set("tejas_lead_done", true);
    if (C.leadEndpoint) {
      fetch(C.leadEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(record) }).catch(() => {});
    }
  }

  /* ═══════════════ Static fills ═══════════════ */
  $("#logo").src = C.logo;
  $("#footLogo").src = C.logo;
  $$("[data-years]").forEach((n) => (n.textContent = C.yearsOfLegacy));
  $("#year").textContent = new Date().getFullYear();

  const genericMsg = "Hi Tejas Lifespaces, I'm interested in your projects. Please share details.";
  ["#dockWa", "#mbWa"].forEach((s) => ($(s).href = wa(genericMsg)));
  ["#dockCall", "#mbCall"].forEach((s) => ($(s).href = `tel:${C.mobile}`));

  /* ═══════════════ Header, progress, nav ═══════════════ */
  const header = $("#header");
  const progress = $("#progress");
  const navLinks = $$(".nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  function onScroll() {
    const y = scrollY;
    header.classList.toggle("is-solid", y > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.35) current = s.id; });
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  const nav = $("#nav");
  const navScrim = $("#navScrim");
  function setNav(open) {
    nav.classList.toggle("is-open", open);
    navScrim.classList.toggle("is-on", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  navScrim.addEventListener("click", () => setNav(false));
  nav.addEventListener("click", (e) => { if (e.target.matches("a")) setNav(false); });
  addEventListener("resize", () => { if (innerWidth > 1020 && nav.classList.contains("is-open")) setNav(false); });

  /* ═══════════════ Reveal + counters ═══════════════ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  const observeReveals = () => $$(".reveal:not(.is-in)").forEach((n) => io.observe(n));
  observeReveals();

  const counts = {
    years: C.yearsOfLegacy,
    completed: P.filter((p) => p.status === "completed").length,
    ongoing: ongoing.length,
    cities: new Set(P.map((p) => p.locality)).size,
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const n = e.target, end = counts[n.dataset.count], t0 = performance.now(), dur = 1600;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        n.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 && n.dataset.count !== "ongoing" ? "+" : "");
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(n);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((n) => countIO.observe(n));

  /* ═══════════════ Spotlight (now selling) ═══════════════ */
  let spotIdx = 0, spotTimer, spotPaused = false;
  const spotTabs = $("#spotlightTabs");
  const spotStage = $("#spotlightStage");

  spotTabs.innerHTML = ongoing.map((p, i) => `
    <button class="spot-tab" role="tab" data-i="${i}">
      <img src="${esc(p.cover)}" alt="" />
      <span>${esc(p.name)}<small>${esc(where(p))}</small></span>
    </button>`).join("");

  function renderSpot(i) {
    spotIdx = i;
    const p = ongoing[i];
    $$(".spot-tab", spotTabs).forEach((t, j) => { t.classList.toggle("is-on", j === i); t.setAttribute("aria-selected", j === i); });
    spotStage.innerHTML = `
      <div class="spot">
        <div class="spot__media" data-gallery="${p.id}">
          <img src="${esc(p.banner)}" alt="${esc(p.name)} elevation" />
          ${p.rera ? `<span class="spot__rera">MahaRERA <b>${esc(p.rera)}</b></span>` : ""}
        </div>
        <div class="spot__body">
          <h3>${esc(p.name)}</h3>
          <p class="spot__loc"><svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(where(p))}</p>
          <p class="spot__quote">${esc(p.tagline)}</p>
          <div class="facts">${p.facts.map(([k, v]) => `<div class="fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
          <div class="spot__ctas">
            <button class="btn btn--gold" data-open="${p.id}">Explore project</button>
            <button class="btn btn--ghost" data-lead="Price list for ${esc(p.name)}" data-project="${p.id}">Get price list</button>
          </div>
        </div>
      </div>`;
  }
  function startSpot() {
    clearInterval(spotTimer);
    spotTimer = setInterval(() => { if (!spotPaused && spotInView && !document.hidden) renderSpot((spotIdx + 1) % ongoing.length); }, 7000);
  }
  spotTabs.addEventListener("click", (e) => {
    const b = e.target.closest(".spot-tab");
    if (b) { renderSpot(+b.dataset.i); startSpot(); }
  });
  let spotInView = false, spotTouched = false;
  $("#spotlight").addEventListener("mouseenter", () => (spotPaused = true));
  $("#spotlight").addEventListener("mouseleave", () => (spotPaused = spotTouched));
  $("#spotlight").addEventListener("touchstart", () => (spotTouched = spotPaused = true), { passive: true });
  new IntersectionObserver(([e]) => (spotInView = e.isIntersecting), { threshold: 0.4 }).observe($("#spotlight"));
  renderSpot(0);
  startSpot();

  /* ═══════════════ Shortlist ═══════════════ */
  let shortlist = store.get("tejas_shortlist", []).filter(byId);
  const heartSVG = `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>`;

  function syncShortlist(bump) {
    store.set("tejas_shortlist", shortlist);
    const badge = $("#shortlistCount");
    badge.textContent = shortlist.length;
    badge.classList.toggle("is-on", shortlist.length > 0);
    if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
    $$(".heart").forEach((h) => h.classList.toggle("is-on", shortlist.includes(h.dataset.heart)));
    renderDrawer();
  }
  function toggleShort(id) {
    const on = !shortlist.includes(id);
    shortlist = on ? [...shortlist, id] : shortlist.filter((x) => x !== id);
    syncShortlist(true);
    toast(on ? `${byId(id).name} added to your shortlist` : "Removed from shortlist");
  }
  function renderDrawer() {
    const list = $("#drawerList");
    if (!shortlist.length) {
      list.innerHTML = `<li><div class="muted">Tap the ♥ on any project to save it here.</div></li>`;
      $("#drawerWa").style.display = "none";
      return;
    }
    list.innerHTML = shortlist.map((id) => {
      const p = byId(id);
      return `<li>
        ${p.cover ? `<img src="${esc(p.cover)}" alt="" />` : `<span class="ph"></span>`}
        <div><b>${esc(p.name)}</b><small>${esc(where(p))}</small></div>
        <button data-unshort="${p.id}" aria-label="Remove">×</button>
      </li>`;
    }).join("");
    const names = shortlist.map((id) => "• " + byId(id).name + " (" + where(byId(id)) + ")").join("\n");
    $("#drawerWa").style.display = "";
    $("#drawerWa").href = wa(`Hi Tejas Lifespaces, I've shortlisted these projects:\n${names}\nPlease share availability and prices.`);
  }
  $("#shortlistBtn").addEventListener("click", () => openLayer($("#drawer")));
  $("#drawerList").addEventListener("click", (e) => { const b = e.target.closest("[data-unshort]"); if (b) toggleShort(b.dataset.unshort); });

  /* ═══════════════ Explorer ═══════════════ */
  const filters = { status: "", city: "", config: "", q: "" };
  const cities = [...new Set(P.map((p) => p.city))].sort();
  const cityOpts = cities.map((c) => `<option>${esc(c)}</option>`).join("");
  $("#cityFilter").insertAdjacentHTML("beforeend", cityOpts);
  $("#finderCity").insertAdjacentHTML("beforeend", cityOpts);

  const statusLabel = { ongoing: "Ongoing", upcoming: "Upcoming", completed: "Delivered" };

  function matches(p) {
    if (filters.status && p.status !== filters.status) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.config && !(p.configs || []).some((c) => c.startsWith(filters.config))) return false;
    if (filters.q) {
      const hay = `${p.name} ${p.locality} ${p.city} ${(p.configs || []).join(" ")}`.toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  }

  const GRID_LIMIT = 8;
  let showAll = false;
  let legacyHits = [];
  const filtering = () => !!(filters.status || filters.city || filters.config || filters.q);

  function renderExplorer() {
    const order = { ongoing: 0, upcoming: 1, completed: 2 };
    const hits = P.filter(matches).sort((a, b) => order[a.status] - order[b.status]);
    const withImg = hits.filter((p) => p.cover);
    legacyHits = hits.filter((p) => !p.cover);
    const shown = showAll || filtering() ? withImg : withImg.slice(0, GRID_LIMIT);

    $("#grid").innerHTML = shown.map((p, i) => `
      <article class="card" data-open="${p.id}" style="animation-delay:${Math.min(i, 10) * 40}ms" tabindex="0">
        <span class="status status--${p.status}">${statusLabel[p.status]}</span>
        <button class="heart ${shortlist.includes(p.id) ? "is-on" : ""}" data-heart="${p.id}" aria-label="Shortlist ${esc(p.name)}">${heartSVG}</button>
        <div class="card__img"><img src="${esc(p.cover)}" alt="${esc(p.name)}" loading="lazy" /></div>
        <div class="card__body">
          <h3>${esc(p.name)}</h3>
          <div class="card__loc">${esc(where(p))}</div>
          ${p.configs ? `<div class="card__configs">${p.configs.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div>` : ""}
        </div>
      </article>`).join("");

    const more = $("#showAll");
    more.hidden = shown.length === withImg.length;
    more.textContent = `Show all ${withImg.length} projects`;

    // Heritage projects have no photos, so they live on the skyline rather than in the grid
    const n = legacyHits.length;
    $("#legacyHint").hidden = !n;
    $("#legacyHintText").innerHTML = filtering()
      ? `<b>${n}</b> more delivered project${n === 1 ? "" : "s"} match${n === 1 ? "es" : ""} on our legacy skyline`
      : `<b>+${n}</b> more delivered heritage projects across Navi Mumbai &amp; Panvel`;
    $("#empty").hidden = hits.length > 0;
    $("#resultCount").textContent = `${hits.length} project${hits.length === 1 ? "" : "s"}`;
  }
  $("#showAll").addEventListener("click", () => { showAll = true; renderExplorer(); });
  $("#legacyHint").addEventListener("click", () => {
    skyline.highlight(filtering() ? legacyHits.map((p) => p.id) : null, filtering() ? "Matching your search" : null);
    $("#legacy").scrollIntoView({ behavior: "smooth" });
  });

  function setStatus(s) {
    filters.status = s;
    $$("#statusSeg button").forEach((b) => b.classList.toggle("is-on", b.dataset.status === s));
  }
  $("#statusSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { setStatus(b.dataset.status); renderExplorer(); }
  });
  $("#cityFilter").addEventListener("change", (e) => { filters.city = e.target.value; renderExplorer(); });
  $("#configFilter").addEventListener("change", (e) => { filters.config = e.target.value; renderExplorer(); });
  $("#search").addEventListener("input", (e) => { filters.q = e.target.value.trim(); renderExplorer(); });
  $("#resetFilters").addEventListener("click", () => {
    Object.assign(filters, { city: "", config: "", q: "" });
    setStatus("");
    $("#cityFilter").value = $("#configFilter").value = $("#search").value = "";
    renderExplorer();
  });

  $("#finder").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    filters.city = f.get("city");
    filters.config = f.get("config");
    filters.q = "";
    setStatus(f.get("status"));
    $("#cityFilter").value = filters.city;
    $("#configFilter").value = filters.config;
    $("#search").value = "";
    renderExplorer();
    $("#projects").scrollIntoView({ behavior: "smooth" });
  });

  renderExplorer();

  /* ═══════════════ Legacy skyline ═══════════════
   * Every delivered project is drawn as a building. Shapes are generated from the
   * project id, so they stay the same on every visit. Signature projects (the ones
   * with photos) are taller and lit gold; heritage projects are the low-rise blocks.
   */
  const skyline = (() => {
    const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
    const rng = (seed) => () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const delivered = P.filter((p) => p.status === "completed");
    // Districts run roughly north → south; localities not listed here go at the end
    const ORDER = ["Kharghar", "Kamothe", "Navade", "Kalundre", "Vichumbe", "Adai Village", "Ulwe", "Dronagiri"];
    const rank = (l) => (ORDER.includes(l) ? ORDER.indexOf(l) : ORDER.length);
    const districts = [...new Set(delivered.map((p) => p.locality))]
      .sort((a, b) => rank(a) - rank(b))
      .map((loc) => {
        const all = delivered.filter((p) => p.locality === loc);
        const sig = all.filter((p) => p.tier === "signature");
        const her = all.filter((p) => p.tier !== "signature");
        const half = Math.ceil(her.length / 2);
        return { loc, items: [...her.slice(0, half), ...sig, ...her.slice(half)] }; // towers in the middle
      });
    const flat = districts.flatMap((d) => d.items);

    function tower(p, i) {
      const r = rng(hash(p.id));
      const sig = p.tier === "signature";
      const cols = sig ? 4 + (r() < 0.5) : 2 + (r() < 0.6);
      const floors = sig ? 10 + Math.floor(r() * 6) : 4 + Math.floor(r() * 5);
      const W = cols * 6 + 5, TOP = 14, H = TOP + floors * 10 + 12;
      let s = `<rect class="t-body" x="0" y="${TOP}" width="${W}" height="${H - TOP}"/>`;
      for (let f = 0; f < floors; f++) {
        for (let c = 0; c < cols; c++) {
          const lit = r() < (sig ? 0.72 : 0.5);
          s += `<rect class="${lit ? "t-lit" : "t-dark"}" x="${4 + c * 6}" y="${TOP + 3 + f * 10}" width="3" height="5"${lit ? ` opacity="${(0.5 + r() * 0.5).toFixed(2)}"` : ""}/>`;
        }
      }
      s += `<rect class="t-base" x="0" y="${H - 12}" width="${W}" height="12"/><rect class="t-door" x="${W / 2 - 3}" y="${H - 9}" width="6" height="9"/>`;
      const roof = sig ? 4 : Math.floor(r() * 4);
      if (roof === 0) s += `<rect class="t-roof" x="-1" y="${TOP - 3}" width="${W + 2}" height="3"/>`;
      if (roof === 1) s += `<rect class="t-roof" x="${3 + Math.floor(r() * (W - 14))}" y="${TOP - 8}" width="8" height="8"/>`;
      if (roof === 2) s += `<rect class="t-roof" x="3" y="${TOP - 7}" width="${W - 6}" height="7"/>`;
      if (roof === 3) s += `<rect class="t-roof" x="0" y="${TOP - 2}" width="${W}" height="2"/><path class="t-mast" d="M${W - 6} ${TOP - 2}V1"/>`;
      if (roof === 4) s += `<rect class="t-roof" x="2" y="${TOP - 6}" width="${W - 4}" height="6"/><rect class="t-crown" x="2" y="${TOP - 7}" width="${W - 4}" height="1.5"/><path class="t-mast" d="M${W / 2} ${TOP - 7}V0"/>`;
      return `<button class="bldg${sig ? " bldg--sig" : ""}" data-sky="${p.id}" style="--d:${i}" tabindex="${i ? -1 : 0}" aria-label="${esc(p.name)}, ${esc(where(p))}">
        <svg viewBox="0 -1 ${W} ${H + 1}" width="${W}" height="${H + 1}" aria-hidden="true">${s}</svg></button>`;
    }

    let k = 0;
    $("#skyTrack").innerHTML = districts.map((d) => `
      <div class="district" data-district="${esc(d.loc)}">
        <div class="district__row">${d.items.map((p) => tower(p, k++)).join("")}</div>
        <div class="district__label">${esc(d.loc)} <b>${d.items.length}</b></div>
      </div>`).join("");

    // Faint far-off city behind the interactive one, so wide screens don't look empty at the edges
    const back = rng(7);
    let x = 0, bs = "";
    while (x < 2400) { const w = 18 + back() * 40, h = 30 + back() * 120; bs += `<rect x="${x.toFixed(0)}" y="${(170 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>`; x += w + 2 + back() * 8; }
    $("#skyBack").setAttribute("viewBox", "0 0 2400 170");
    $("#skyBack").innerHTML = bs;

    $("#skyTotal").textContent = delivered.length;
    $("#skyChips").innerHTML =
      `<button class="is-on" data-sky-loc="">All <b>${delivered.length}</b></button>` +
      [...districts].sort((a, b) => b.items.length - a.items.length)
        .map((d) => `<button data-sky-loc="${esc(d.loc)}">${esc(d.loc)} <b>${d.items.length}</b></button>`).join("");

    const root = $("#skyline"), plaque = $("#skyPlaque");
    let selected = null, focus = null, focusLabel = "";

    function paint() {
      $$(".bldg", root).forEach((b) => {
        b.classList.toggle("is-on", b.dataset.sky === selected);
        b.classList.toggle("is-hl", !!focus && focus.has(b.dataset.sky));
      });
      root.classList.toggle("has-focus", !!focus);
      const chipLoc = focus && districts.find((d) => d.loc === focusLabel) ? focusLabel : focus ? null : "";
      $$("#skyChips button").forEach((c) => c.classList.toggle("is-on", c.dataset.skyLoc === chipLoc));
    }

    function showPlaque(id) {
      const p = id && byId(id);
      let html;
      if (p) {
        const sig = p.tier === "signature";
        html = `
          <div class="plaque plaque--item">
            ${sig ? `<img src="${esc(p.cover)}" alt="" />` : `<span class="plaque__mono">${esc(p.name.replace(/^Tejas\s+/, "")[0])}</span>`}
            <div class="plaque__text">
              <small>${sig ? "Signature" : "Heritage"} · Delivered</small>
              <b>${esc(p.name)}</b>
              <span>${esc(where(p))}</span>
            </div>
            <div class="plaque__ctas">
              ${sig
                ? `<button class="btn btn--gold btn--sm" data-open="${p.id}">View project</button>`
                : `<button class="btn btn--gold btn--sm" data-lead="Details for homes near ${esc(p.name)}, ${esc(p.locality)}" data-project="">Homes in ${esc(p.locality)}?</button>
                   <button class="btn btn--ghost btn--sm" data-open="${p.id}">Area map</button>`}
            </div>
          </div>`;
      } else if (focus) {
        const list = flat.filter((q) => focus.has(q.id));
        html = `
          <div class="plaque plaque--group">
            <div class="plaque__text"><small>${esc(focusLabel || "Selection")}</small><b>${list.length} delivered project${list.length === 1 ? "" : "s"}</b></div>
            <div class="plaque__names">${list.map((q) => `<button data-sky-pick="${q.id}" class="${q.tier === "signature" ? "is-sig" : ""}">${esc(q.name)}</button>`).join("")}</div>
          </div>`;
      } else {
        const locs = districts.length;
        html = `
          <div class="plaque plaque--intro">
            <div class="plaque__stat"><b>${delivered.length}</b><span>projects handed over</span></div>
            <div class="plaque__stat"><b>${locs}</b><span>localities</span></div>
            <div class="plaque__stat"><b>${delivered.filter((p) => p.tier === "signature").length}</b><span>signature towers</span></div>
            <p class="plaque__hint"><i></i>Tap a building to see its name</p>
          </div>`;
      }
      plaque.innerHTML = html;
    }

    function select(id) {
      selected = selected === id ? null : id;
      paint();
      showPlaque(selected);
    }
    function highlight(ids, label) {
      focus = ids && ids.length ? new Set(ids) : null;
      focusLabel = label || "";
      selected = null;
      paint();
      showPlaque(null);
    }

    $("#skyTrack").addEventListener("click", (e) => {
      const b = e.target.closest(".bldg");
      if (b) select(b.dataset.sky);
    });
    // Desktop: preview on hover, fall back to the selection when the pointer leaves
    if (matchMedia("(hover: hover)").matches) {
      $("#skyTrack").addEventListener("mouseover", (e) => { const b = e.target.closest(".bldg"); if (b) showPlaque(b.dataset.sky); });
      $("#skyTrack").addEventListener("mouseleave", () => showPlaque(selected));
    }
    // Roving focus: one tab stop for the whole skyline, arrow keys move between buildings
    $("#skyTrack").addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const all = $$(".bldg", root);
      const i = all.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const j = e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : Math.max(0, Math.min(all.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
      all[i].tabIndex = -1;
      all[j].tabIndex = 0;
      all[j].focus();
      all[j].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      showPlaque(all[j].dataset.sky);
    });
    $("#skyChips").addEventListener("click", (e) => {
      const c = e.target.closest("[data-sky-loc]");
      if (!c) return;
      const loc = c.dataset.skyLoc;
      highlight(loc ? delivered.filter((p) => p.locality === loc).map((p) => p.id) : null, loc);
      if (loc) {
        const d = $(`.district[data-district="${CSS.escape(loc)}"]`, root);
        const sc = $("#skyScroll");
        if (sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: d.offsetLeft - (sc.clientWidth - d.offsetWidth) / 2, behavior: "smooth" });
      }
    });
    plaque.addEventListener("click", (e) => {
      const n = e.target.closest("[data-sky-pick]");
      if (n) { selected = n.dataset.skyPick; paint(); showPlaque(selected); }
    });

    // Tablets and small laptops: shrink the skyline to fit. Phones: keep full size and swipe.
    function fit() {
      const sc = $("#skyScroll"), tr = $("#skyTrack");
      tr.style.zoom = "";
      const ratio = sc.clientWidth / tr.scrollWidth;
      const z = ratio < 1 && innerWidth > 680 ? Math.max(ratio, 0.7) : 1;
      tr.style.zoom = z === 1 ? "" : z;
      root.style.setProperty("--ground", 46 * z + "px");
      root.classList.toggle("is-scrollable", sc.scrollWidth > sc.clientWidth + 2);
    }
    addEventListener("resize", fit);
    fit();

    // Buildings rise into place the first time the skyline scrolls into view
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { root.classList.add("is-up"); obs.disconnect(); }
    }, { threshold: 0.25 }).observe(root);

    showPlaque(null);
    return { highlight };
  })();

  /* ═══════════════ Layers (modal / drawer / lightbox) ═══════════════ */
  let lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => (el.querySelector("[data-close].modal__x, .modal__x, input, button") || el).focus(), 50);
  }
  function closeLayer(el) {
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (!$(".modal.is-open, .drawer.is-open, .lightbox.is-open, .nav.is-open")) document.body.style.overflow = "";
    if (el.id === "projectModal" && location.hash.startsWith("#p/")) history.replaceState(null, "", location.pathname + location.search);
    lastFocus?.focus?.();
  }
  $$(".modal, .drawer, .lightbox").forEach((layer) =>
    layer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeLayer(layer); })
  );
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (nav.classList.contains("is-open")) return setNav(false);
      const top = $(".lightbox.is-open") || $$(".modal.is-open, .drawer.is-open").pop();
      if (top) closeLayer(top);
    }
    if ($("#lightbox").classList.contains("is-open")) {
      if (e.key === "ArrowRight") stepLightbox(1);
      if (e.key === "ArrowLeft") stepLightbox(-1);
    }
  });

  /* ═══════════════ Lightbox ═══════════════ */
  let lbImages = [], lbIdx = 0;
  function openLightbox(images, i = 0) {
    lbImages = images; lbIdx = i;
    showLightbox();
    openLayer($("#lightbox"));
  }
  function showLightbox() {
    $("#lbImg").src = lbImages[lbIdx];
    $("#lbCount").textContent = `${lbIdx + 1} / ${lbImages.length}`;
    $("#lbPrev").hidden = $("#lbNext").hidden = lbImages.length < 2;
  }
  function stepLightbox(d) { lbIdx = (lbIdx + d + lbImages.length) % lbImages.length; showLightbox(); }
  $("#lbPrev").addEventListener("click", () => stepLightbox(-1));
  $("#lbNext").addEventListener("click", () => stepLightbox(1));
  let touchX = null;
  $("#lightbox").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  $("#lightbox").addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ═══════════════ Project modal ═══════════════ */
  function openProject(id) {
    const p = byId(id);
    if (!p) return;
    const gallery = p.gallery || (p.cover ? [p.cover] : []);
    const rich = p.status === "ongoing";
    const tabs = rich
      ? [["overview", "Overview"], ...(p.amenities?.length ? [["amenities", "Amenities"]] : []), ["connectivity", "Connectivity"], ["map", "Map"]]
      : [];

    const panes = {
      overview: `<p class="spot__quote" style="color:var(--ink)">${esc(p.tagline || "")}</p><ul>${(p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`,
      amenities: `<div class="amen">${(p.amenities || []).map((a, i) => `<figure data-amen="${i}"><img src="${esc(a.img)}" alt="${esc(a.name)}" loading="lazy" /><figcaption>${esc(a.name)}</figcaption></figure>`).join("")}</div>`,
      connectivity: `<p class="muted">${esc(p.connectivityNote || "")}</p><ul class="conn">${(p.connectivity || []).map((c) => `<li><span>${esc(c.name)}</span><em>${esc(c.time)}</em></li>`).join("")}</ul>`,
      map: `<div class="pm__map"><iframe loading="lazy" title="${esc(p.name)} map" src="${mapEmbed(p.mapQuery || where(p), 14)}"></iframe></div>
            ${p.mapLink ? `<p style="margin-top:10px"><a class="link" href="${esc(p.mapLink)}" target="_blank" rel="noopener">Open exact location in Google Maps →</a></p>` : ""}`,
    };

    const statusLine = {
      ongoing: "Now booking",
      upcoming: "Launching soon — register your interest for early-bird offers.",
      completed: "Delivered by Tejas. Ask us about resale availability or similar homes in this area.",
    }[p.status];

    $("#pmBody").innerHTML = `
      <div class="pm__hero">
        ${gallery[0] ? `<img src="${esc(gallery[0])}" alt="${esc(p.name)}" data-lb="0" id="pmHeroImg" />` : ""}
        <div class="pm__title"><span class="status status--${p.status}" style="position:static;display:inline-block;margin-bottom:8px">${statusLabel[p.status]}</span><h3 id="pmTitle">${esc(p.name)}</h3><p>${esc(where(p))}</p></div>
      </div>
      ${gallery.length > 1 ? `<div class="pm__thumbs">${gallery.map((g, i) => `<button data-thumb="${i}" class="${i ? "" : "is-on"}"><img src="${esc(g)}" alt="" loading="lazy" /></button>`).join("")}</div>` : ""}
      <div class="pm__main">
        <div>
          ${rich ? `<div class="seg seg--small pm__tabs" id="pmTabs">${tabs.map(([k, l], i) => `<button data-tab="${k}" class="${i ? "" : "is-on"}">${l}</button>`).join("")}</div>
                    <div id="pmPane" class="pm__pane">${panes.overview}</div>`
                 : `<p class="muted">${esc(statusLine)}</p>
                    <div class="pm__map"><iframe loading="lazy" title="${esc(p.name)} area map" src="${mapEmbed(where(p), 14)}"></iframe></div>`}
        </div>
        <aside class="pm__side">
          <div class="pm__price">${esc(p.price || (p.status === "ongoing" ? "Price on request" : statusLabel[p.status]))}</div>
          ${p.configs ? `<div class="card__configs" style="margin-bottom:14px">${p.configs.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}${p.commercial ? `<span class="tag">${esc(p.commercial)}</span>` : ""}</div>` : ""}
          ${p.facts ? `<div class="facts">${p.facts.map(([k, v]) => `<div class="fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>` : ""}
          ${p.status === "ongoing" ? `<a href="#visit" class="btn btn--gold btn--block" data-visit="${p.id}">Book a site visit</a>` : ""}
          <button class="btn btn--ghost-dark btn--block" data-lead="${p.status === "ongoing" ? "Price list & floor plans" : "Details"} for ${esc(p.name)}" data-project="${p.id}">${p.status === "ongoing" ? "Get price list & floor plans" : p.status === "upcoming" ? "Register interest" : "Enquire about this area"}</button>
          <a class="btn btn--whatsapp btn--block" target="_blank" rel="noopener" href="${wa(`Hi, I'm interested in ${p.name} (${where(p)}). Please share details.`)}">WhatsApp us</a>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn btn--ghost-dark btn--sm" style="flex:1" data-heart-modal="${p.id}">${shortlist.includes(p.id) ? "♥ Shortlisted" : "♡ Shortlist"}</button>
            <button class="btn btn--ghost-dark btn--sm" style="flex:1" data-share="${p.id}">Share</button>
          </div>
          ${p.rera ? `<p class="pm__rera">MahaRERA Registration No: <b>${esc(p.rera)}</b><br/>maharera.maharashtra.gov.in</p>` : ""}
        </aside>
      </div>`;

    const body = $("#pmBody");
    body.onclick = (e) => {
      const t = e.target;
      const thumb = t.closest("[data-thumb]");
      if (thumb) {
        const i = +thumb.dataset.thumb;
        $("#pmHeroImg").src = gallery[i];
        $("#pmHeroImg").dataset.lb = i;
        $$("[data-thumb]", body).forEach((b) => b.classList.toggle("is-on", b === thumb));
        return;
      }
      if (t.matches("[data-lb]")) return openLightbox(gallery, +t.dataset.lb);
      const amen = t.closest("[data-amen]");
      if (amen) return openLightbox(p.amenities.map((a) => a.img), +amen.dataset.amen);
      const tab = t.closest("[data-tab]");
      if (tab) {
        $$("[data-tab]", body).forEach((b) => b.classList.toggle("is-on", b === tab));
        const pane = $("#pmPane");
        pane.innerHTML = panes[tab.dataset.tab];
        pane.style.animation = "none"; void pane.offsetWidth; pane.style.animation = "";
        return;
      }
      const hm = t.closest("[data-heart-modal]");
      if (hm) { toggleShort(p.id); hm.textContent = shortlist.includes(p.id) ? "♥ Shortlisted" : "♡ Shortlist"; return; }
      if (t.closest("[data-share]")) return shareProject(p);
      const visit = t.closest("[data-visit]");
      if (visit) { closeLayer($("#projectModal")); wizard.preselect(p.id); }
    };

    history.replaceState(null, "", "#p/" + p.id);
    openLayer($("#projectModal"));
    $("#pmBody").scrollTop = 0;
  }

  async function shareProject(p) {
    const url = location.href.split("#")[0] + "#p/" + p.id;
    const data = { title: p.name, text: `${p.name} — ${where(p)} by Tejas Lifespaces`, url };
    if (navigator.share) { try { await navigator.share(data); return; } catch {} }
    try { await navigator.clipboard.writeText(url); toast("Link copied — paste it anywhere to share"); }
    catch { prompt("Copy this link:", url); }
  }

  function openFromHash() {
    const m = location.hash.match(/^#p\/(.+)$/);
    if (m && byId(m[1])) openProject(m[1]);
  }
  addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ═══════════════ Global click delegation ═══════════════ */
  document.addEventListener("click", (e) => {
    const heart = e.target.closest("[data-heart]");
    if (heart) { e.stopPropagation(); toggleShort(heart.dataset.heart); return; }
    const lead = e.target.closest("[data-lead]");
    if (lead) { openLead(lead.dataset.lead, lead.dataset.project); return; }
    const opener = e.target.closest("[data-open]");
    if (opener) { openProject(opener.dataset.open); return; }
    const gal = e.target.closest("[data-gallery]");
    if (gal) { const p = byId(gal.dataset.gallery); openLightbox(p.gallery, Math.max(0, p.gallery.indexOf(p.banner))); }
  });
  $("#grid").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".card")) openProject(e.target.dataset.open);
  });

  /* ═══════════════ Location explorer ═══════════════ */
  let locProject = ongoing[0];
  $("#locSeg").innerHTML = ongoing.map((p, i) => `<button data-loc="${p.id}" class="${i ? "" : "is-on"}">${esc(p.name)}</button>`).join("");

  function renderLoc(p, focus = -1) {
    locProject = p;
    $$("#locSeg button").forEach((b) => b.classList.toggle("is-on", b.dataset.loc === p.id));
    $("#locList").innerHTML =
      `<li class="loc__note">${esc(p.connectivityNote)}</li>` +
      `<li><button class="loc__item ${focus === -1 ? "is-on" : ""}" data-li="-1"><i></i><b>${esc(p.name)} (project)</b><em>${esc(p.locality)}</em></button></li>` +
      p.connectivity.map((c, i) => `<li><button class="loc__item ${i === focus ? "is-on" : ""}" data-li="${i}"><i></i><b>${esc(c.name)}</b><em>${esc(c.time)}</em></button></li>`).join("");

    const map = $("#locMap");
    const card = $("#locCard");
    if (focus === -1) {
      map.src = mapEmbed(p.mapQuery, 14);
      card.innerHTML = `<img src="${esc(p.cover)}" alt="" /><div><b>${esc(p.name)}</b>${esc(where(p))}<br/><a href="${esc(p.mapLink)}" target="_blank" rel="noopener">Open in Google Maps →</a></div>`;
    } else {
      const c = p.connectivity[focus];
      map.src = mapEmbed(c.q, 13);
      card.innerHTML = `${c.img ? `<img src="${esc(c.img)}" alt="" />` : ""}<div><b>${esc(c.name)}</b>${esc(c.time)} from ${esc(p.name)}<br/><a href="${directions(p.mapQuery, c.q)}" target="_blank" rel="noopener">Get directions →</a></div>`;
    }
    card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
  }
  $("#locSeg").addEventListener("click", (e) => { const b = e.target.closest("[data-loc]"); if (b) renderLoc(byId(b.dataset.loc)); });
  $("#locList").addEventListener("click", (e) => { const b = e.target.closest("[data-li]"); if (b) renderLoc(locProject, +b.dataset.li); });

  // Load map iframes only when near the viewport
  const lazyMaps = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      if (e.target.id === "location") renderLoc(locProject);
      if (e.target.id === "contact") $("#officeMap").src = mapEmbed(C.officeMapQuery, 15);
      lazyMaps.unobserve(e.target);
    });
  }, { rootMargin: "300px" });
  lazyMaps.observe($("#location"));
  lazyMaps.observe($("#contact"));

  /* ═══════════════ EMI calculator ═══════════════ */
  const amt = $("#amt"), rate = $("#rate"), tenure = $("#tenure");
  const CIRC = 2 * Math.PI * 48;
  function paintRange(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%"); }
  function calcEMI() {
    const P0 = +amt.value, r = +rate.value / 1200, n = +tenure.value * 12;
    const emi = r ? (P0 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P0 / n;
    const total = emi * n, interest = total - P0;
    $("#amtOut").textContent = lakhs(P0);
    $("#rateOut").textContent = (+rate.value).toFixed(2) + "%";
    $("#tenureOut").textContent = tenure.value + " yrs";
    $("#emiOut").textContent = inr(emi);
    $("#pOut").textContent = inr(P0);
    $("#iOut").textContent = inr(interest);
    $("#tOut").textContent = inr(total);
    const share = P0 / total;
    $("#donutP").style.strokeDasharray = `${CIRC * share} ${CIRC}`;
    [amt, rate, tenure].forEach(paintRange);
  }
  [amt, rate, tenure].forEach((r) => r.addEventListener("input", calcEMI));
  calcEMI();

  /* ═══════════════ About ═══════════════ */
  $("#aboutPhoto").src = A.photo;
  $("#aboutHeading").textContent = A.heading;
  $("#aboutIntro").textContent = A.intro;
  $("#aboutFamily").textContent = A.family;
  $("#pillarTabs").innerHTML = A.pillars.map((p, i) => `<button data-pillar="${i}" class="${i ? "" : "is-on"}">Our ${esc(p.key)}</button>`).join("");
  function renderPillar(i) {
    const p = A.pillars[i];
    $$("#pillarTabs button").forEach((b, j) => b.classList.toggle("is-on", j === i));
    const body = $("#pillarBody");
    body.innerHTML = `<img src="${esc(p.icon)}" alt="" /><p>${esc(p.text)}</p>`;
    body.style.animation = "none"; void body.offsetWidth; body.style.animation = "";
  }
  $("#pillarTabs").addEventListener("click", (e) => { const b = e.target.closest("[data-pillar]"); if (b) renderPillar(+b.dataset.pillar); });
  renderPillar(0);
  $("#strengths").innerHTML = A.strengths.map((s, i) => `
    <div class="strength reveal"><span>0${i + 1}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join("");
  observeReveals();

  /* ═══════════════ Site-visit wizard ═══════════════ */
  const wizard = (() => {
    const form = $("#wizard");
    const state = { step: 0, project: null, config: null, day: null, time: null };
    const times = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

    $("#wizProjects").innerHTML = ongoing.map((p) => `
      <button type="button" data-wp="${p.id}"><img src="${esc(p.cover)}" alt="" /><span><b>${esc(p.name)}</b><small>${esc(where(p))}</small></span></button>`).join("");

    const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i + 1); return d; });
    $("#wizDays").innerHTML = days.map((d, i) => `
      <button type="button" data-wd="${i}"><small>${d.toLocaleDateString("en-IN", { weekday: "short" })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString("en-IN", { month: "short" })}</small></button>`).join("");
    $("#wizTimes").innerHTML = times.map((t) => `<button type="button" data-wt="${t}">${t}</button>`).join("");

    function renderConfigs() {
      const p = byId(state.project);
      const opts = p ? [...p.configs, ...(p.commercial ? ["Shop / Commercial"] : [])] : [];
      $("#wizConfigs").innerHTML = opts.length
        ? opts.map((c) => `<button type="button" data-wc="${esc(c)}" class="${state.config === c ? "is-on" : ""}">${esc(c)}</button>`).join("")
        : `<span class="muted">Select a project first</span>`;
    }
    renderConfigs();

    function go(step) {
      state.step = step;
      $$(".wizard__pane", form).forEach((p) => p.classList.toggle("is-on", +p.dataset.step === step));
      $$("#wizSteps li").forEach((li, i) => { li.classList.toggle("is-on", i === step); li.classList.toggle("is-done", i < step); });
      $("#wizBack").disabled = step === 0;
      $("#wizNext").textContent = step === 2 ? "Request visit" : "Next";
      $("#wizError").textContent = "";
    }

    function validate() {
      if (state.step === 0) {
        if (!state.project) return "Please choose a project.";
        if (!state.config) return "Please choose a home type.";
      }
      if (state.step === 1) {
        if (state.day === null) return "Please pick a day.";
        if (!state.time) return "Please pick a time.";
      }
      if (state.step === 2) {
        const name = form.fullname.value.trim(), phone = form.phone.value.trim();
        form.fullname.classList.toggle("is-bad", !name);
        form.phone.classList.toggle("is-bad", !validPhone(phone));
        if (!name) return "Please enter your name.";
        if (!validPhone(phone)) return "Please enter a valid 10-digit mobile number.";
      }
      return "";
    }

    function submit() {
      if (form.website.value) return; // bot
      const p = byId(state.project);
      const day = days[state.day].toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
      const lead = {
        type: "site-visit", project: p.name, config: state.config, date: day, time: state.time,
        name: form.fullname.value.trim(), phone: form.phone.value.trim(), email: form.email.value.trim(), pickup: form.pickup.checked,
      };
      saveLead(lead);
      $("#wizSummary").textContent = `${lead.name}, we've noted your visit to ${p.name} on ${day} at ${state.time}. Our team will call ${lead.phone} to confirm.`;
      $("#wizWhatsapp").href = wa(
        `Hi Tejas Lifespaces, I'd like to book a site visit.\n\nProject: ${p.name}\nInterested in: ${state.config}\nDate: ${day}\nTime: ${state.time}\nName: ${lead.name}\nPhone: ${lead.phone}${lead.pickup ? "\nPickup required: Yes" : ""}`
      );
      $$(".wizard__pane, .wizard__steps, .wizard__nav, .wizard__error", form).forEach((n) => (n.hidden = true));
      $(".wizard__done", form).hidden = false;
    }

    form.addEventListener("click", (e) => {
      const t = e.target.closest("[data-wp], [data-wc], [data-wd], [data-wt]");
      if (!t) return;
      if (t.dataset.wp) { state.project = t.dataset.wp; state.config = null; $$("[data-wp]").forEach((b) => b.classList.toggle("is-on", b === t)); renderConfigs(); }
      if (t.dataset.wc) { state.config = t.dataset.wc; $$("[data-wc]").forEach((b) => b.classList.toggle("is-on", b === t)); }
      if (t.dataset.wd) { state.day = +t.dataset.wd; $$("[data-wd]").forEach((b) => b.classList.toggle("is-on", b === t)); }
      if (t.dataset.wt) { state.time = t.dataset.wt; $$("[data-wt]").forEach((b) => b.classList.toggle("is-on", b === t)); }
      $("#wizError").textContent = "";
    });
    $("#wizBack").addEventListener("click", () => go(Math.max(0, state.step - 1)));
    $("#wizNext").addEventListener("click", () => {
      const err = validate();
      if (err) { $("#wizError").textContent = err; return; }
      state.step < 2 ? go(state.step + 1) : submit();
    });
    $("#wizRestart").addEventListener("click", () => {
      Object.assign(state, { project: null, config: null, day: null, time: null });
      form.reset();
      $$(".is-on", form).forEach((n) => n.classList.remove("is-on"));
      $$(".wizard__pane, .wizard__steps, .wizard__nav, .wizard__error", form).forEach((n) => (n.hidden = false));
      $(".wizard__done", form).hidden = true;
      renderConfigs();
      go(0);
    });
    form.addEventListener("submit", (e) => e.preventDefault());

    return {
      preselect(id) {
        $(`[data-wp="${id}"]`)?.click();
        go(0);
        setTimeout(() => $("#visit").scrollIntoView({ behavior: "smooth" }), 60);
      },
    };
  })();

  /* ═══════════════ Lead modal ═══════════════ */
  const leadForm = $("#leadForm");
  $("#lmProject").innerHTML =
    `<option value="">Any / not sure yet</option>` +
    P.filter((p) => p.status !== "completed").map((p) => `<option value="${p.id}">${esc(p.name)} — ${esc(where(p))}</option>`).join("");

  function openLead(intent = "Price list & floor plans", projectId = "") {
    leadForm.hidden = false;
    $(".lead__done").hidden = true;
    $("#lmError").textContent = "";
    leadForm.intent.value = intent;
    const opt = [...$("#lmProject").options].some((o) => o.value === projectId);
    $("#lmProject").value = opt ? projectId : "";
    $("#lmTitle").textContent = intent.startsWith("Help") ? "Home-loan assistance" : intent.startsWith("Details") ? "Tell me more" : "Get the price list & floor plans";
    $("#lmSub").textContent = intent.startsWith("Help")
      ? "Our loan desk works with all major banks. Leave your number and we'll call you back."
      : "Share your details and we'll send them to you on WhatsApp.";
    session.set("tejas_popup_seen", "1");
    openLayer($("#leadModal"));
  }

  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (leadForm.website.value) return;
    const name = leadForm.fullname.value.trim(), phone = leadForm.phone.value.trim();
    leadForm.fullname.classList.toggle("is-bad", !name);
    leadForm.phone.classList.toggle("is-bad", !validPhone(phone));
    if (!name) return ($("#lmError").textContent = "Please enter your name.");
    if (!validPhone(phone)) return ($("#lmError").textContent = "Please enter a valid 10-digit mobile number.");
    const p = byId(leadForm.project.value);
    const intent = leadForm.intent.value;
    saveLead({ type: "enquiry", intent, project: p?.name || "Any", name, phone });
    $("#lmWhatsapp").href = wa(`Hi Tejas Lifespaces, I'm ${name}. ${intent}${p && !intent.includes(p.name) ? ` (${p.name})` : ""}. My number: ${phone}`);
    leadForm.hidden = true;
    $(".lead__done").hidden = false;
  });

  // Gentle prompts: once per session after 35s, or on exit intent (desktop)
  function maybePrompt() {
    if (session.get("tejas_popup_seen") || store.get("tejas_lead_done", false)) return;
    if ($(".modal.is-open, .drawer.is-open, .lightbox.is-open")) return;
    openLead("Price list & floor plans", "");
  }
  const canHover = matchMedia("(hover: hover) and (min-width: 900px)").matches;
  if (canHover) setTimeout(maybePrompt, 35000);
  document.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget && e.clientY <= 0 && scrollY > innerHeight) maybePrompt();
  });

  /* ═══════════════ Footer ═══════════════ */
  $("#footAddress").textContent = C.address;
  $("#contactList").innerHTML = `
    <li><a href="tel:${C.phone}">☎ ${esc(C.phoneDisplay)}</a></li>
    <li><a href="tel:${C.mobile}">✆ ${esc(C.mobileDisplay)}</a></li>
    <li><a href="mailto:${C.email}">✉ ${esc(C.email)}</a></li>
    <li><a href="${wa(genericMsg)}" target="_blank" rel="noopener">● Chat on WhatsApp</a></li>`;
  $("#footProjects").innerHTML = P.filter((p) => p.status !== "completed" || p.tier === "signature").slice(0, 8)
    .map((p) => `<li><a href="#p/${p.id}">${esc(p.name)}</a></li>`).join("");
  $("#socials").innerHTML = Object.entries(C.social).filter(([, u]) => u)
    .map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a>`).join("");

  syncShortlist(false);
})();
