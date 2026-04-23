const STORAGE_KEY = "BOOKSHELF_APP_DICODING";
let editId = null;
let currentLang = localStorage.getItem("lang") || "id";

// --- Fitur Tema ---
window.toggleTheme = () => {
  const target = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", target);
  localStorage.setItem("theme", target);
  updateThemeUI();
};

function updateThemeUI() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.getElementById("themeBtn").innerText = isDark ? "☀️ Light" : "🌙 Dark";
}

// --- Fitur Bahasa (Multi-lang) ---
const i18n = {
  id: {
    mainTitle: "Bookshelf App", formHeader: "Tambah Buku Baru", labelTitle: "Judul", labelAuthor: "Penulis", labelYear: "Tahun",
    labelComplete: "Selesai dibaca", submitText: "Masukkan Buku ke rak", searchHeader: "Cari Buku", labelSearch: "Judul", 
    searchBtn: "Cari", incTitle: "Belum selesai dibaca", comTitle: "Selesai dibaca", rackInc: "Belum selesai", rackCom: "Selesai",
    btnDone: "Selesai dibaca", btnUndo: "Belum selesai", btnDel: "Hapus Buku", btnEdit: "Edit Buku", confirmDel: "Hapus buku ini?"
  },
  en: {
    mainTitle: "Bookshelf App", formHeader: "Add New Book", labelTitle: "Title", labelAuthor: "Author", labelYear: "Year",
    labelComplete: "Finished reading", submitText: "Put book on shelf", searchHeader: "Search Book", labelSearch: "Title",
    searchBtn: "Search", incTitle: "Incomplete", comTitle: "Finished", rackInc: "Incomplete", rackCom: "Finished",
    btnDone: "Finish", btnUndo: "Undo", btnDel: "Delete Book", btnEdit: "Edit Book", confirmDel: "Delete this book?"
  }
};

window.toggleLanguage = () => {
  currentLang = currentLang === "id" ? "en" : "id";
  localStorage.setItem("lang", currentLang);
  applyLanguage();
};

function applyLanguage() {
  const t = i18n[currentLang];
  document.getElementById("mainTitle").innerText = t.mainTitle;
  document.getElementById("formHeader").innerText = t.formHeader;
  document.getElementById("labelTitle").innerText = t.labelTitle;
  document.getElementById("labelAuthor").innerText = t.labelAuthor;
  document.getElementById("labelYear").innerText = t.labelYear;
  document.getElementById("labelComplete").innerText = t.labelComplete;
  document.getElementById("submitText").innerText = t.submitText;
  document.getElementById("searchHeader").innerText = t.searchHeader;
  document.getElementById("labelSearch").innerText = t.labelSearch;
  document.getElementById("searchSubmit").innerText = t.searchBtn;
  document.getElementById("incTitle").innerText = t.incTitle;
  document.getElementById("comTitle").innerText = t.comTitle;
  document.getElementById("langBtn").innerText = currentLang === "id" ? "EN" : "ID";
  updateRackText();
  render();
}

// --- Logika Inti ---
function getBooks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function render(books = getBooks()) {
  const incompleteList = document.getElementById("incompleteBookList");
  const completeList = document.getElementById("completeBookList");
  const t = i18n[currentLang];

  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  books.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.setAttribute("data-bookid", book.id);
    bookElement.setAttribute("data-testid", "bookItem");
    bookElement.classList.add("book-item");

    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div class="actions">
        <button class="btn-complete" data-testid="bookItemIsCompleteButton" onclick="toggleStatus(${book.id})">
          ${book.isComplete ? t.btnUndo : t.btnDone}
        </button>
        <button class="btn-delete" data-testid="bookItemDeleteButton" onclick="deleteBook(${book.id})">
          ${t.btnDel}
        </button>
        <button class="btn-edit" data-testid="bookItemEditButton" onclick="editBook(${book.id})">
          ${t.btnEdit}
        </button>
      </div>
    `;

    if (book.isComplete) completeList.appendChild(bookElement);
    else incompleteList.appendChild(bookElement);
  });
}

document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = Number(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  let books = getBooks();
  if (editId) {
    books = books.map(b => b.id === editId ? { ...b, title, author, year, isComplete } : b);
    editId = null;
  } else {
    books.push({ id: +new Date(), title, author, year, isComplete });
  }

  saveBooks(books);
  document.getElementById("bookForm").reset();
  updateRackText();
  render();
});

window.toggleStatus = (id) => {
  const books = getBooks().map(b => b.id === id ? { ...b, isComplete: !b.isComplete } : b);
  saveBooks(books);
  render();
};

window.deleteBook = (id) => {
  if (confirm(i18n[currentLang].confirmDel)) {
    saveBooks(getBooks().filter(b => b.id !== id));
    render();
  }
};

window.editBook = (id) => {
  const book = getBooks().find(b => b.id === id);
  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;
  editId = id;
  updateRackText();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById("searchBook").addEventListener("submit", (e) => {
  e.preventDefault();
  const keyword = document.getElementById("searchBookTitle").value.toLowerCase();
  const filtered = getBooks().filter(b => b.title.toLowerCase().includes(keyword));
  render(filtered);
});

function updateRackText() {
  const checkbox = document.getElementById("bookFormIsComplete");
  const targetText = document.getElementById("targetRack");
  const t = i18n[currentLang];
  targetText.innerText = checkbox.checked ? t.rackCom : t.rackInc;
}

document.getElementById("bookFormIsComplete").addEventListener("change", updateRackText);

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeUI();
  applyLanguage();
});