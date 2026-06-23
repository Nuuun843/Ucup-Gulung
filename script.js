/* ===========================================================
   KONFIGURASI TOKO
   Ganti nomor WhatsApp di bawah ini dengan nomor WA tujuan
   (format internasional tanpa "+" atau "0" di depan, contoh
   untuk 0812-3456-7890 -> "6281234567890")
=========================================================== */
const NOMOR_WA_TOKO = "6281234567890";
const NAMA_TOKO = "Kak Gulung";

/* ===========================================================
   DATA MENU
   Silakan ubah/tambah/hapus item sesuai varian yang dijual.
=========================================================== */
const MENU = [
  // ---- Telur Gulung ----
  { id: "tg-original", cat: "telur", emoji: "🥚", nama: "Telur Gulung Original", desc: "Telur gulung klasik, gurih & lembut, disiram saus sambal.", harga: 3000 },
  { id: "tg-keju", cat: "telur", emoji: "🧀", nama: "Telur Gulung Keju", desc: "Telur gulung ditaburi keju parut melimpah.", harga: 4000 },
  { id: "tg-sosis", cat: "telur", emoji: "🌭", nama: "Telur Gulung Sosis", desc: "Telur gulung dengan potongan sosis di dalamnya.", harga: 4500 },
  { id: "tg-pedas", cat: "telur", emoji: "🌶️", nama: "Telur Gulung Pedas Mercon", desc: "Untuk pencinta pedas, disiram sambal level mantap.", harga: 3500 },
  { id: "tg-spesial", cat: "telur", emoji: "✨", nama: "Telur Gulung Spesial", desc: "Kombo telur, sosis, keju, dan saus kacang.", harga: 6000 },

  // ---- Cireng ----
  { id: "cr-original", cat: "cireng", emoji: "🍘", nama: "Cireng Original", desc: "Cireng renyah luar, kenyal dalam, sambal rujak nampol.", harga: 5000 },
  { id: "cr-bumbu-rujak", cat: "cireng", emoji: "🥭", nama: "Cireng Bumbu Rujak", desc: "Cireng dengan siraman bumbu rujak manis pedas.", harga: 6000 },
  { id: "cr-keju", cat: "cireng", emoji: "🧀", nama: "Cireng Isi Keju", desc: "Cireng isi lelehan keju mozzarella.", harga: 7000 },
  { id: "cr-ayam-suwir", cat: "cireng", emoji: "🍗", nama: "Cireng Isi Ayam Suwir", desc: "Cireng isi ayam suwir pedas manis.", harga: 7500 },
];

/* ===========================================================
   STATE
=========================================================== */
let activeCat = "telur";
const cart = {}; // { [menuId]: qty }

/* ===========================================================
   UTIL
=========================================================== */
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function getCartItems() {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ ...MENU.find((m) => m.id === id), qty }));
}

function getCartTotal() {
  return getCartItems().reduce((sum, item) => sum + item.harga * item.qty, 0);
}

function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.qty, 0);
}

/* ===========================================================
   RENDER: DAFTAR MENU
=========================================================== */
const menuListEl = document.getElementById("menu-list");

function renderMenuList() {
  const items = MENU.filter((m) => m.cat === activeCat);
  menuListEl.innerHTML = items.map(renderMenuCard).join("");
}

function renderMenuCard(item) {
  const qty = cart[item.id] || 0;
  return `
    <article class="menu-card ${qty > 0 ? "menu-card--active" : ""}" data-id="${item.id}">
      <div class="menu-card__emoji" aria-hidden="true">${item.emoji}</div>
      <div class="menu-card__body">
        <h3 class="menu-card__name">${item.nama}</h3>
        <p class="menu-card__desc">${item.desc}</p>
        <span class="menu-card__price">${formatRupiah(item.harga)}</span>
      </div>
      <div class="menu-card__controls">
        <button class="qty-btn qty-btn--minus" type="button" data-action="minus" data-id="${item.id}" aria-label="Kurangi ${item.nama}">−</button>
        <span class="qty-value" data-qty-for="${item.id}">${qty}</span>
        <button class="qty-btn qty-btn--plus" type="button" data-action="plus" data-id="${item.id}" aria-label="Tambah ${item.nama}">+</button>
      </div>
    </article>
  `;
}

/* Update tampilan satu kartu saja (lebih ringan daripada render ulang semua) */
function updateCardUI(id) {
  const card = menuListEl.querySelector(`.menu-card[data-id="${id}"]`);
  if (!card) return;
  const qty = cart[id] || 0;
  card.querySelector(`[data-qty-for="${id}"]`).textContent = qty;
  card.classList.toggle("menu-card--active", qty > 0);
}

/* ===========================================================
   RENDER: ORDER BAR
=========================================================== */
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const orderBarBtn = document.getElementById("btn-pesan-sekarang");

function updateOrderBar() {
  const count = getCartCount();
  const total = getCartTotal();
  cartCountEl.textContent = `${count} item`;
  cartTotalEl.textContent = formatRupiah(total);
  orderBarBtn.disabled = count === 0;
}

/* ===========================================================
   EVENTS: TABS KATEGORI
=========================================================== */
const tabsEl = document.getElementById("tabs");

tabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  activeCat = btn.dataset.cat;

  tabsEl.querySelectorAll(".tab").forEach((t) => {
    const isActive = t === btn;
    t.classList.toggle("tab--active", isActive);
    t.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  renderMenuList();
});

/* ===========================================================
   EVENTS: TAMBAH / KURANG QTY
=========================================================== */
menuListEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  const current = cart[id] || 0;
  if (action === "plus") {
    cart[id] = current + 1;
    showToast(`${MENU.find((m) => m.id === id).nama} ditambahkan`);
  } else if (action === "minus" && current > 0) {
    cart[id] = current - 1;
  }

  updateCardUI(id);
  updateOrderBar();
});

/* ===========================================================
   TOAST
=========================================================== */
const toastEl = document.getElementById("toast");
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("toast--show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("toast--show");
  }, 1500);
}

/* ===========================================================
   NAVIGASI ANTAR HALAMAN
=========================================================== */
const pageMenu = document.getElementById("page-menu");
const pageCheckout = document.getElementById("page-checkout");

function goToCheckout() {
  if (getCartCount() === 0) return;
  renderSummary();
  pageMenu.classList.remove("page--active");
  pageCheckout.classList.add("page--active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function goToMenu() {
  pageCheckout.classList.remove("page--active");
  pageMenu.classList.add("page--active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

orderBarBtn.addEventListener("click", goToCheckout);
document.getElementById("btn-back").addEventListener("click", goToMenu);

/* ===========================================================
   RENDER: RINGKASAN PESANAN (halaman checkout)
=========================================================== */
const summaryListEl = document.getElementById("summary-list");
const summaryTotalEl = document.getElementById("summary-total-price");

function renderSummary() {
  const items = getCartItems();

  if (items.length === 0) {
    summaryListEl.innerHTML = `<li class="empty-summary">Belum ada pesanan. Yuk pilih menu dulu!</li>`;
  } else {
    summaryListEl.innerHTML = items
      .map(
        (item) => `
        <li>
          <span class="item-name">${item.qty}× ${item.nama}</span>
          <span class="item-price">${formatRupiah(item.harga * item.qty)}</span>
        </li>
      `
      )
      .join("");
  }

  summaryTotalEl.textContent = formatRupiah(getCartTotal());
}

/* ===========================================================
   FORM PEMBELI -> KIRIM KE WHATSAPP
=========================================================== */
const buyerForm = document.getElementById("buyer-form");
const formHint = document.getElementById("form-hint");

buyerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const namaLengkap = document.getElementById("nama_lengkap").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const catatan = document.getElementById("catatan").value.trim();

  if (!namaLengkap || !alamat) {
    formHint.textContent = "Nama lengkap dan alamat wajib diisi ya.";
    return;
  }

  const items = getCartItems();
  if (items.length === 0) {
    formHint.textContent = "Keranjang masih kosong, pilih menu dulu ya.";
    return;
  }

  formHint.textContent = "";

  const pesanWA = susunPesanWA(namaLengkap, alamat, catatan, items, getCartTotal());
  const waUrl = `https://wa.me/${NOMOR_WA_TOKO}?text=${encodeURIComponent(pesanWA)}`;
  window.location.href = waUrl;
});

function susunPesanWA(nama, alamat, catatan, items, total) {
  const daftarItem = items
    .map((item) => `- ${item.nama} x${item.qty} = ${formatRupiah(item.harga * item.qty)}`)
    .join("\n");

  let pesan = `Halo ${NAMA_TOKO}, saya ingin memesan:\n\n`;
  pesan += `${daftarItem}\n\n`;
  pesan += `Total: ${formatRupiah(total)}\n\n`;
  pesan += `Nama lengkap: ${nama}\n`;
  pesan += `Alamat: ${alamat}\n`;
  if (catatan) pesan += `Catatan: ${catatan}\n`;
  pesan += `\nMohon konfirmasinya, terima kasih!`;

  return pesan;
}

/* ===========================================================
   INISIALISASI
=========================================================== */
renderMenuList();
updateOrderBar();
