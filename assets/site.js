const C = window.APP_CONFIG || {},
  DEMO = {
    settings: {
      company_name: "SPBU 24.331.116",
      about:
        "SPBU 24.331.116 berlokasi di Bacang, Kota Pangkalpinang. Kami berupaya menghadirkan pelayanan yang tertib, ramah, dan mengutamakan keselamatan serta kenyamanan pelanggan.",
      address: "Jalan Depati Hamzah, Bacang, Kota Pangkalpinang",
      whatsapp: C.WHATSAPP_NUMBER || "6281272937522",
      hero_text:
        "SPBU 24.331.116 Bacang, Pangkalpinang. Komitmen kami adalah memberikan pelayanan energi yang aman, nyaman, dan profesional bagi masyarakat.",
    },
    services: [
      {
        id: "s1",
        title: "Pelayanan BBM",
        description:
          "Pelayanan pengisian BBM sesuai ketentuan dan standar operasional.",
        icon: "⛽",
        active: "TRUE",
      },
      {
        id: "s2",
        title: "Area Pengisian",
        description:
          "Fasilitas pengisian yang mengutamakan ketertiban dan keselamatan.",
        icon: "🚘",
        active: "TRUE",
      },
      {
        id: "s3",
        title: "Informasi Pelanggan",
        description: "Informasi layanan dan bantuan bagi pelanggan SPBU.",
        icon: "✦",
        active: "TRUE",
      },
    ],
    products: [],
    news: [],
    gallery: [],
    carousel: [],
  };
let DATA = DEMO,
  cart = [];
const money = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
function toast(t) {
  let e = document.getElementById("toast");
  e.textContent = t;
  e.classList.remove("hidden");
  setTimeout(() => e.classList.add("hidden"), 2600);
}
async function apiGet(action) {
  if (!C.API_URL || C.API_URL.includes("PASTE_")) return null;
  try {
    let r = await fetch(C.API_URL + "?action=" + encodeURIComponent(action));
    return await r.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}
async function apiPost(payload) {
  if (!C.API_URL || C.API_URL.includes("PASTE_"))
    return { ok: false, message: "API belum dikonfigurasi" };
  try {
    let r = await fetch(C.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, message: "Gagal terhubung ke server" };
  }
}
function active(a) {
  return String(a).toLowerCase() !== "false" && String(a) !== "0";
}
function img(src, cls) {
  return src
    ? `<img class="${cls}" src="${esc(src)}" alt="">`
    : `<div class="${cls}" style="display:grid;place-items:center;background:linear-gradient(135deg,#34234f,#182a42);font-size:42px">✦</div>`;
}
function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function render() {
  let s = DATA.settings || DEMO.settings;
  document.title = (s.company_name || C.SITE_NAME) + " | Company Profile";
  document.getElementById("heroText").textContent =
    s.hero_text || DEMO.settings.hero_text;
  document.getElementById("aboutText").textContent =
    s.about || DEMO.settings.about;
  document.getElementById("addressText").textContent =
    s.address || DEMO.settings.address;
  document.getElementById("footerAddress").textContent =
    s.address || DEMO.settings.address;
  let wa = s.whatsapp || C.WHATSAPP_NUMBER;
  document.getElementById("contactWA").href = "https://wa.me/" + wa;
  document.getElementById("footerWA").href = "https://wa.me/" + wa;
  const video = document.getElementById("aboutVideo");
  const videoHint = document.getElementById("videoHint");
  if (s.about_video) {
    const videoUrl = String(s.about_video).trim();
    if (video.dataset.src !== videoUrl) {
      video.pause();
      video.removeAttribute("src");
      while (video.firstChild) video.removeChild(video.firstChild);
      const source = document.createElement("source");
      source.src = videoUrl;
      const cleanPath = videoUrl.split("?")[0].split("#")[0].toLowerCase();
      source.type = cleanPath.endsWith(".webm")
        ? "video/webm"
        : cleanPath.endsWith(".mp4")
          ? "video/mp4"
          : "";
      video.appendChild(source);
      video.dataset.src = videoUrl;
      video.load();
      if (videoHint) videoHint.textContent = "Memuat video profil…";
      const play = video.play();
      if (play && play.catch)
        play.catch(() => {
          if (videoHint)
            videoHint.textContent =
              "Video siap. Tekan tombol Play jika pemutaran otomatis diblokir browser.";
        });
    }
    video.classList.remove("hidden");
  } else {
    video.pause();
    video.removeAttribute("src");
    while (video.firstChild) video.removeChild(video.firstChild);
    video.dataset.src = "";
    video.load();
    video.classList.add("hidden");
    if (videoHint) videoHint.textContent = "Video profil SPBU 24.331.116";
  }
  document.getElementById("carouselList").innerHTML = (DATA.carousel || [])
    .filter((x) => active(x.active))
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map(
      (x) =>
        `<article class="card" style="padding:12px">${img(x.image, "news-img")}<h3>${esc(x.title)}</h3><p class="muted">${esc(x.subtitle || "")}</p></article>`,
    )
    .join("");
  document
    .getElementById("promoCarousel")
    .classList.toggle(
      "hidden",
      !(DATA.carousel || []).some((x) => active(x.active)),
    );
  document.getElementById("servicesList").innerHTML =
    (DATA.services || [])
      .filter((x) => active(x.active))
      .map(
        (x) =>
          `<article class="card"><div class="iconbox">${esc(x.icon || "✦")}</div><h3>${esc(x.title)}</h3><p class="muted">${esc(x.description)}</p></article>`,
      )
      .join("") ||
    '<div class="empty">Informasi layanan akan segera diperbarui.</div>';
  document.getElementById("productsList").innerHTML =
    (DATA.products || [])
      .filter((x) => active(x.active))
      .map(
        (x) =>
          `<article class="card product-card">${img(x.image, "product-img")}<span class="pill">${esc(x.category || "Produk")}</span><h3>${esc(x.name)}</h3><p class="muted">${esc(x.description)}</p><div class="price">${money(x.price)}</div><button onclick="addCart('${esc(x.id)}')">+ Tambah ke Keranjang</button><button class="btn-outline share-card" onclick="shareItem('product','${esc(x.id)}','${esc(x.name)}')">↗ Bagikan Produk</button></article>`,
      )
      .join("") ||
    '<div class="empty">Belum ada produk katalog yang ditampilkan.</div>';
  document.getElementById("newsList").innerHTML =
    (DATA.news || [])
      .filter((x) => active(x.active))
      .slice(0, 12)
      .map(
        (x) =>
          `<article class="card">${img(x.image, "news-img")}<p class="eyebrow">${esc(x.date || "Informasi")}</p><h3>${esc(x.title)}</h3><p class="muted">${esc(x.excerpt || x.content || "")}</p><button class="btn-outline share-card" onclick="shareItem('news','${esc(x.id)}','${esc(x.title)}')">↗ Bagikan Berita</button></article>`,
      )
      .join("") || '<div class="empty">Belum ada berita.</div>';
  document.getElementById("galleryList").innerHTML =
    (DATA.gallery || [])
      .filter((x) => active(x.active))
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
      .slice(0, 18)
      .map(
        (x) =>
          `<article class="card">${img(x.image, "gallery-img")}<h3>${esc(x.title)}</h3></article>`,
      )
      .join("") || '<div class="empty">Galeri akan ditampilkan di sini.</div>';
  ["carouselList", "servicesList", "productsList"].forEach((id) =>
    document.getElementById(id)?.classList.add("responsive-carousel"),
  );
  setupCarousel("newsList");
  setupCarousel("galleryList");
  document.getElementById("year").textContent = new Date().getFullYear();
}
const carouselTimers = {};
function visibleSlides() {
  return window.matchMedia("(max-width:600px)").matches
    ? 1
    : window.matchMedia("(max-width:1024px)").matches
      ? 2
      : 3;
}
function setupCarousel(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.index = "0";
  el.style.setProperty("--slides", visibleSlides());
  el.classList.add("carousel-track");
  updateCarousel(id);
  if (!el.dataset.swipeReady) {
    let startX = 0;
    el.addEventListener(
      "touchstart",
      (e) => {
        startX = e.changedTouches[0].clientX;
      },
      { passive: true },
    );
    el.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 40) moveCarousel(id, delta < 0 ? 1 : -1);
      },
      { passive: true },
    );
    el.dataset.swipeReady = "1";
  }
  if (carouselTimers[id]) clearInterval(carouselTimers[id]);
  carouselTimers[id] = setInterval(() => moveCarousel(id, 1), 4500);
}
function updateCarousel(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const cards = [...el.querySelectorAll(":scope > .card")];
  const count = visibleSlides(),
    max = Math.max(0, cards.length - count);
  let index = Math.min(Number(el.dataset.index || 0), max);
  el.dataset.index = index;
  el.style.setProperty("--slides", count);
  el.style.transform = `translateX(calc(-${index} * (100% / ${count} + 16px / ${count})))`;
  const shell = el.closest(".carousel-shell");
  if (shell) {
    shell.classList.toggle("is-static", cards.length <= count);
    shell.querySelector(".prev").disabled = index <= 0;
    shell.querySelector(".next").disabled = index >= max;
  }
}
function moveCarousel(id, step) {
  const el = document.getElementById(id);
  if (!el) return;
  const max = Math.max(0, el.children.length - visibleSlides());
  el.dataset.index = Math.max(
    0,
    Math.min(max, Number(el.dataset.index || 0) + step),
  );
  updateCarousel(id);
}
window.addEventListener("resize", () =>
  ["newsList", "galleryList"].forEach(updateCarousel),
);
function toggleAboutVideo() {
  const v = document.getElementById("aboutVideo");
  if (v.paused) v.play().catch(() => {});
  else v.pause();
}
function stopAboutVideo() {
  const v = document.getElementById("aboutVideo");
  v.pause();
  v.currentTime = 0;
}
(function bindAboutVideoDiagnostics() {
  const v = document.getElementById("aboutVideo");
  if (!v) return;
  const hint = document.getElementById("videoHint");
  v.addEventListener("loadedmetadata", () => {
    if (hint)
      hint.textContent =
        "Video profil berhasil dimuat. Gunakan kontrol untuk memutar atau menghentikan.";
  });
  v.addEventListener("canplay", () => {
    if (hint) hint.textContent = "Video profil siap diputar.";
  });
  v.addEventListener("error", () => {
    if (hint) {
      const code = v.error?.code;
      hint.textContent =
        code === 4
          ? "Format atau codec video tidak didukung browser. Konversi video ke MP4 H.264 atau WebM VP8/VP9, lalu unggah ulang."
          : "Video gagal dimuat. Periksa URL GitHub Pages, akses file, dan MIME type video/webm atau video/mp4.";
    }
  });
})();

async function load() {
  let d = await apiGet("public");
  if (d && d.ok) DATA = d.data;
  render();
}
function addCart(id) {
  let p = (DATA.products || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  let item = cart.find((x) => x.id === id);
  if (item) item.qty++;
  else cart.push({ id: p.id, name: p.name, price: Number(p.price), qty: 1 });
  updateCart();
  toast("Produk ditambahkan");
}
function updateCart() {
  document.getElementById("cartCount").textContent = cart.reduce(
    (a, b) => a + b.qty,
    0,
  );
  document.getElementById("cartItems").innerHTML = cart.length
    ? cart
        .map(
          (x, i) =>
            `<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #ffffff15"><div><b>${esc(x.name)}</b><div class="small muted">${money(x.price)} × ${x.qty}</div></div><div class="actions"><button class="btn-sm" onclick="qtyCart(${i},-1)">−</button><button class="btn-sm" onclick="qtyCart(${i},1)">+</button></div></div>`,
        )
        .join("")
    : "<p class='muted'>Keranjang masih kosong.</p>";
  document.getElementById("cartTotal").textContent = money(
    cart.reduce((a, b) => a + b.price * b.qty, 0),
  );
}
function qtyCart(i, n) {
  cart[i].qty += n;
  if (cart[i].qty < 1) cart.splice(i, 1);
  updateCart();
}
function openCart() {
  document.getElementById("cartModal").classList.remove("hidden");
  updateCart();
}
function closeCart() {
  document.getElementById("cartModal").classList.add("hidden");
}
async function checkout() {
  if (!cart.length) return toast("Keranjang masih kosong");
  let name = document.getElementById("custName").value.trim(),
    phone = document.getElementById("custPhone").value.trim(),
    address = document.getElementById("custAddress").value.trim(),
    notes = document.getElementById("custNotes").value.trim();
  if (!name || !phone) return toast("Nama dan nomor HP wajib diisi");
  let total = cart.reduce((a, b) => a + b.price * b.qty, 0),
    order = {
      customerName: name,
      phone,
      address,
      notes,
      total,
      items: cart.map((x) => ({ ...x })),
    };
  let result = await apiPost({ action: "createOrder", order });
  if (!result.ok && C.API_URL && !C.API_URL.includes("PASTE_"))
    return toast(result.message || "Pesanan gagal disimpan");
  let wa = (DATA.settings || {}).whatsapp || C.WHATSAPP_NUMBER;
  let lines = cart
    .map(
      (x) =>
        `- ${x.name} (${x.qty} x ${money(x.price)}) = ${money(x.qty * x.price)}`,
    )
    .join("\n");
  let msg = `Halo SPBU 24.331.116, saya ingin melakukan pemesanan.\nNama: ${name}\nNo. HP: ${phone}\nAlamat: ${address}\n\n${lines}\nTotal: ${money(total)}\nCatatan: ${notes}\n${result.orderId ? "No. Pesanan: " + result.orderId : ""}`;
  window.open(
    "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg),
    "_blank",
  );
  cart = [];
  updateCart();
  closeCart();
  toast("Pesanan dicatat. Lanjutkan konfirmasi di WhatsApp.");
}

function shareEndpoint(type, id) {
  const base =
    C.API_URL && !C.API_URL.includes("PASTE_")
      ? C.API_URL
      : C.SITE_URL || location.href;
  const u = new URL(base);
  u.searchParams.set("share", type);
  if (id) u.searchParams.set("id", id);
  return u.toString();
}
async function shareItem(type, id, title) {
  const url = shareEndpoint(type, id);
  const data = {
    title: title || "SPBU 24.331.116 Bacang",
    text: "Informasi dari SPBU 24.331.116 Bacang, Pangkalpinang",
    url,
  };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(url);
      toast("Link berbagi berhasil disalin");
    }
  } catch (e) {
    if (e.name !== "AbortError") toast("Tidak dapat membagikan link");
  }
}
function shareWebsite() {
  shareItem("home", "", "SPBU 24.331.116 Bacang");
}
load();
