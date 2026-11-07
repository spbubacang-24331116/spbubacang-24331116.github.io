const C = window.APP_CONFIG || {},
  TABLES = {
    products: {
      title: "Produk",
      fields: [
        ["name", "Nama Produk", "text"],
        ["description", "Deskripsi", "textarea"],
        ["price", "Harga (angka)", "number"],
        ["category", "Kategori", "text"],
        ["stock", "Stok", "number"],
        ["image", "URL Gambar", "text"],
        ["active", "Tampilkan?", "select"],
      ],
    },
    services: {
      title: "Layanan",
      fields: [
        ["title", "Nama Layanan", "text"],
        ["description", "Deskripsi", "textarea"],
        ["icon", "Ikon/Emoji", "text"],
        ["sort", "Urutan", "number"],
        ["active", "Tampilkan?", "select"],
      ],
    },
    news: {
      title: "Berita",
      fields: [
        ["title", "Judul", "text"],
        ["excerpt", "Ringkasan", "textarea"],
        ["content", "Isi Berita", "textarea"],
        ["image", "URL Gambar", "text"],
        ["date", "Tanggal", "date"],
        ["active", "Tampilkan?", "select"],
      ],
    },
    carousel: {
      title: "Carousel",
      fields: [
        ["title", "Judul", "text"],
        ["subtitle", "Subjudul", "text"],
        ["image", "URL Gambar", "text"],
        ["sort", "Urutan", "number"],
        ["active", "Tampilkan?", "select"],
      ],
    },
    gallery: {
      title: "Galeri",
      fields: [
        ["title", "Judul Foto", "text"],
        ["image", "URL Gambar", "text"],
        ["sort", "Urutan", "number"],
        ["active", "Tampilkan?", "select"],
      ],
    },
  };
let TOKEN = sessionStorage.getItem("spbu_token") || "",
  USER = sessionStorage.getItem("spbu_user") || "",
  CURRENT = "dashboard",
  ROWS = {},
  EDIT = null;
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function toast(t) {
  let e = document.getElementById("toast");
  e.textContent = t;
  e.classList.remove("hidden");
  setTimeout(() => e.classList.add("hidden"), 2600);
}
async function post(p) {
  if (!C.API_URL || C.API_URL.includes("PASTE_"))
    return { ok: false, message: "API_URL belum diatur di config.js" };
  try {
    let r = await fetch(C.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...p, token: TOKEN }),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, message: "Tidak dapat menghubungi API" };
  }
}
async function get(action) {
  if (!C.API_URL || C.API_URL.includes("PASTE_"))
    return { ok: false, message: "API_URL belum diatur" };
  try {
    return await (
      await fetch(
        C.API_URL + "?action=" + action + "&token=" + encodeURIComponent(TOKEN),
      )
    ).json();
  } catch (e) {
    return { ok: false, message: "Gagal mengambil data" };
  }
}
async function adminLogin(e) {
  e.preventDefault();
  let r = await post({
    action: "login",
    username: document.getElementById("loginUser").value,
    password: document.getElementById("loginPass").value,
  });
  if (!r.ok) {
    document.getElementById("loginError").textContent =
      r.message || "Login gagal";
    return;
  }
  TOKEN = r.token;
  USER = r.user.username;
  sessionStorage.setItem("spbu_token", TOKEN);
  sessionStorage.setItem("spbu_user", USER);
  showAdmin();
}
function logout() {
  TOKEN = "";
  USER = "";
  sessionStorage.clear();
  document.getElementById("adminView").classList.add("hidden");
  document.getElementById("loginView").classList.remove("hidden");
}
async function showAdmin() {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("adminView").classList.remove("hidden");
  document.getElementById("adminUserLabel").textContent = USER;
  await navigate("dashboard");
}
document
  .querySelectorAll(".side-link[data-page]")
  .forEach((x) => x.addEventListener("click", () => navigate(x.dataset.page)));
async function navigate(page) {
  CURRENT = page;
  document
    .querySelectorAll(".side-link[data-page]")
    .forEach((x) => x.classList.toggle("active", x.dataset.page === page));
  let title =
    TABLES[page]?.title ||
    { dashboard: "Dashboard", orders: "Pesanan", settings: "Pengaturan" }[page];
  document.getElementById("pageTitle").textContent = title;
  if (page === "dashboard") return dashboard();
  if (page === "settings") return settingsPage();
  if (page === "orders") return ordersPage();
  return tablePage(page);
}
async function dashboard() {
  let r = await get("adminSummary");
  if (!r.ok) {
    document.getElementById("pageContent").innerHTML =
      `<div class="notice">${esc(r.message || "Tidak dapat memuat dashboard")}</div>`;
    return;
  }
  let d = r.data;
  document.getElementById("pageContent").innerHTML =
    `<div class="admin-grid"><div class="metric"><span class="muted">Total Produk</span><strong>${d.products}</strong><span class="small muted">Katalog website</span></div><div class="metric"><span class="muted">Berita</span><strong>${d.news}</strong><span class="small muted">Artikel terpublikasi</span></div><div class="metric"><span class="muted">Pesanan</span><strong>${d.orders}</strong><span class="small muted">Total tercatat</span></div><div class="metric"><span class="muted">Pesanan Baru</span><strong>${d.pending}</strong><span class="small muted">Perlu ditindaklanjuti</span></div></div><div class="admin-columns"><div class="card"><h3>Aktivitas Website</h3><p class="muted">Gunakan menu di samping untuk mengelola katalog, layanan, berita, carousel, galeri, dan pesanan.</p><div class="notice">Pastikan informasi jam operasional, ketersediaan layanan, dan pengumuman selalu diperbarui.</div></div><div class="card"><h3>Akses Cepat</h3><p><button onclick="navigate('products')">Kelola Produk</button></p><p><button class="btn-outline" onclick="navigate('news')">Tulis Berita</button></p><p><button class="btn-outline" onclick="navigate('orders')">Lihat Pesanan</button></p></div></div>`;
}
async function tablePage(page) {
  let r = await get("list:" + page);
  if (!r.ok) {
    document.getElementById("pageContent").innerHTML =
      `<div class="notice">${esc(r.message)}</div>`;
    return;
  }
  ROWS[page] = r.data || [];
  let rows = ROWS[page],
    cfg = TABLES[page];
  document.getElementById("pageContent").innerHTML =
    `<div class="card"><div class="section-head"><div><h3>${cfg.title}</h3><p class="muted small">Tambah, ubah, atau hapus data yang tampil di website.</p></div><button onclick="openEditor('${page}')">＋ Tambah ${cfg.title}</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama/Judul</th><th>Status</th><th>Info</th><th>Aksi</th></tr></thead><tbody>${rows.map((x, i) => `<tr><td><b>${esc(x.name || x.title)}</b><div class="small muted">${esc(x.description || x.excerpt || x.category || "")}</div></td><td><span class="tag">${String(x.active).toLowerCase() === "false" ? "Disembunyikan" : "Aktif"}</span></td><td>${page === "products" ? esc("Rp" + Number(x.price || 0).toLocaleString("id-ID")) : esc(x.date || x.sort || "—")}</td><td><div class="actions"><button class="btn-sm btn-outline" onclick="openEditor('${page}',${i})">Edit</button><button class="btn-sm btn-danger" onclick="removeRecord('${page}','${esc(x.id)}')">Hapus</button></div></td></tr>`).join("") || '<tr><td colspan="4" class="muted">Belum ada data.</td></tr>'}</tbody></table></div></div>`;
}
function openEditor(page, index = null) {
  EDIT = { page, index };
  let cfg = TABLES[page],
    x = index === null ? {} : ROWS[page][index];
  document.getElementById("modalTitle").textContent =
    (index === null ? "Tambah " : "Edit ") + cfg.title;
  document.getElementById("editorFields").innerHTML = cfg.fields
    .map(([k, label, type]) => {
      let val = x[k] ?? (k === "active" ? "TRUE" : "");
      if (k === "image")
        return `<div class="field"><label>${label}</label><input class="form-control" name="image" value="${esc(val)}" placeholder="URL gambar atau unggah file"><input class="form-control" style="margin-top:8px" type="file" id="imageUpload" accept="image/jpeg,image/png,image/webp"><small class="muted">JPG/PNG/WebP maksimal 2 MB. Setelah dipilih, gambar diunggah saat menyimpan.</small></div>`;
      if (type === "textarea")
        return `<div class="field"><label>${label}</label><textarea class="form-control" name="${k}" rows="3">${esc(val)}</textarea></div>`;
      if (type === "select")
        return `<div class="field"><label>${label}</label><select class="form-control" name="${k}"><option value="TRUE" ${String(val) !== "false" ? "selected" : ""}>Ya</option><option value="FALSE" ${String(val) === "false" ? "selected" : ""}>Tidak</option></select></div>`;
      return `<div class="field"><label>${label}</label><input class="form-control" type="${type}" name="${k}" value="${esc(val)}" ${k === "price" || k === "stock" || k === "sort" ? "min=0" : ""}></div>`;
    })
    .join("");
  document.getElementById("editModal").classList.remove("hidden");
}
function closeEditor() {
  document.getElementById("editModal").classList.add("hidden");
}
async function saveRecord(e) {
  e.preventDefault();
  let obj = {};
  new FormData(e.target).forEach((v, k) => {
    if (!(v instanceof File)) obj[k] = v;
  });
  let old = EDIT.index === null ? {} : ROWS[EDIT.page][EDIT.index];
  obj.id = old.id;
  let file = document.getElementById("imageUpload")?.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024)
      return toast("Ukuran gambar maksimal 2 MB");
    let dataUrl = await new Promise((resolve, reject) => {
      let fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    let parts = dataUrl.split(",");
    let up = await post({
      action: "uploadImage",
      mime: file.type,
      filename: file.name,
      base64: parts[1],
    });
    if (!up.ok) return toast(up.message || "Upload gambar gagal");
    obj.image = up.url;
  }
  let r = await post({ action: "save:" + EDIT.page, record: obj });
  if (!r.ok) return toast(r.message || "Gagal menyimpan");
  closeEditor();
  toast("Data berhasil disimpan");
  navigate(EDIT.page);
}
async function removeRecord(page, id) {
  if (!confirm("Hapus data ini?")) return;
  let r = await post({ action: "delete:" + page, id });
  if (!r.ok) return toast(r.message || "Gagal menghapus");
  toast("Data dihapus");
  navigate(page);
}
async function ordersPage() {
  let r = await get("list:orders");
  if (!r.ok) {
    document.getElementById("pageContent").innerHTML =
      `<div class="notice">${esc(r.message)}</div>`;
    return;
  }
  let rows = r.data || [];
  document.getElementById("pageContent").innerHTML =
    `<div class="card"><h3>Daftar Pesanan</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>No. Pesanan</th><th>Pelanggan</th><th>Total</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${esc(x.id)}</td><td>${esc(x.customerName)}<div class="small muted">${esc(x.phone)}</div></td><td>Rp${Number(x.total || 0).toLocaleString("id-ID")}</td><td><span class="tag">${esc(x.status)}</span></td><td>${esc(x.createdAt)}</td><td><select class="form-control" onchange="setOrderStatus('${esc(x.id)}',this.value)"><option ${x.status === "Baru" ? "selected" : ""}>Baru</option><option ${x.status === "Diproses" ? "selected" : ""}>Diproses</option><option ${x.status === "Selesai" ? "selected" : ""}>Selesai</option><option ${x.status === "Dibatalkan" ? "selected" : ""}>Dibatalkan</option></select></td></tr>`).join("") || '<tr><td colspan="6">Belum ada pesanan.</td></tr>'}</tbody></table></div></div>`;
}
async function setOrderStatus(id, status) {
  let r = await post({ action: "updateOrderStatus", id, status });
  toast(r.ok ? "Status diperbarui" : r.message);
}
async function settingsPage() {
  let r = await get("settings");
  if (!r.ok) {
    document.getElementById("pageContent").innerHTML =
      `<div class="notice">${esc(r.message)}</div>`;
    return;
  }
  let s = r.data;
  document.getElementById("pageContent").innerHTML =
    `<div class="card"><h3>Identitas Perusahaan</h3><form onsubmit="saveSettings(event)">${Object.entries(
      {
        company_name: "Nama Perusahaan",
        hero_text: "Teks Hero",
        about: "Tentang Perusahaan",
        address: "Alamat",
        whatsapp: "Nomor WhatsApp (628...)",
      },
    )
      .map(
        ([k, l]) =>
          `<div class="field"><label>${l}</label>${k === "about" || k === "hero_text" ? `<textarea class="form-control" rows="3" name="${k}">${esc(s[k] || "")}</textarea>` : `<input class="form-control" name="${k}" value="${esc(s[k] || "")}">`}</div>`,
      )
      .join("")}<button>Simpan Pengaturan</button></form></div>`;
}
async function saveSettings(e) {
  e.preventDefault();
  let values = {};
  new FormData(e.target).forEach((v, k) => (values[k] = v));
  let r = await post({ action: "saveSettings", values });
  toast(r.ok ? "Pengaturan disimpan" : r.message);
}
if (TOKEN) showAdmin();
