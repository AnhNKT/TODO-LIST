"use strict";
var _a, _b, _c;
// ======= CLASS BOOK =======
class Book {
    constructor(title, author, year, status, rating, note, genre) {
        this.title = title;
        this.author = author;
        this.year = year;
        this.status = status;
        this.rating = rating;
        this.note = note;
        this.genre = genre;
    }
}
// ======= CLASS BOOK MANAGER =======
class BookManager {
    constructor() {
        this.books = [];
        this.editingIndex = null;
        this.statusChart = null;
        this.yearChart = null;
        this.loadFromLocal();
        this.showBooks();
        this.showStats();
    }
    // ======= THÊM HOẶC CẬP NHẬT SÁCH =======
    addBook(book) {
        if (this.editingIndex !== null) {
            this.books[this.editingIndex] = book;
            this.toast("📘 Đã cập nhật thông tin sách!");
            this.editingIndex = null;
            document.getElementById("addBtn").textContent = "➕ Thêm sách";
        }
        else {
            this.books.push(book);
            this.toast("✅ Đã thêm sách mới!");
        }
        this.saveToLocal();
        this.showBooks();
        this.showStats();
        this.clearForm();
    }
    // ======= CHỈNH SỬA =======
    editBook(index) {
        const book = this.books[index];
        if (!book)
            return;
        document.getElementById("title").value = book.title;
        document.getElementById("author").value = book.author;
        document.getElementById("year").value = book.year.toString();
        document.getElementById("status").value = book.status;
        document.getElementById("rating").value = book.rating.toString();
        document.getElementById("note").value = book.note;
        document.getElementById("genre").value = book.genre;
        this.editingIndex = index;
        document.getElementById("addBtn").textContent = "💾 Lưu thay đổi";
        this.toast("✏️ Đang chỉnh sửa sách...");
    }
    // ======= XÓA =======
    deleteBook(index) {
        const ok = confirm("Bạn có chắc muốn xóa sách này không?");
        if (ok) {
            this.books.splice(index, 1);
            this.saveToLocal();
            this.showBooks();
            this.showStats();
            this.toast("🗑 Đã xóa sách!");
        }
    }
    // ======= XÓA TOÀN BỘ =======
    deleteAll() {
        if (confirm("Xóa toàn bộ danh sách?")) {
            this.books = [];
            this.saveToLocal();
            this.showBooks();
            this.showStats();
            this.toast("🧹 Đã xóa tất cả sách!");
        }
    }
    // ======= TÌM KIẾM & LỌC =======
    filterBooks(keyword, status, genre) {
        keyword = keyword.toLowerCase();
        return this.books.filter((b) => {
            const matchTitle = b.title.toLowerCase().includes(keyword);
            const matchAuthor = b.author.toLowerCase().includes(keyword);
            const matchYear = b.year.toString().includes(keyword);
            const matchStatus = !status || b.status === status;
            const matchGenre = !genre || b.genre === genre;
            return (matchTitle || matchAuthor || matchYear) && matchStatus && matchGenre;
        });
    }
    // ======= SẮP XẾP =======
    sortBooks(option) {
        if (option === "title") {
            this.books.sort((a, b) => a.title.localeCompare(b.title));
        }
        else if (option === "rating") {
            this.books.sort((a, b) => b.rating - a.rating);
        }
    }
    // ======= LƯU LOCAL =======
    saveToLocal() {
        localStorage.setItem("books", JSON.stringify(this.books));
    }
    loadFromLocal() {
        const data = localStorage.getItem("books");
        if (data) {
            this.books = JSON.parse(data);
        }
    }
    // ======= HIỂN THỊ DANH SÁCH =======
    showBooks(list = this.books) {
        const tbody = document.querySelector("#bookTable tbody");
        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="p-2 text-center">Chưa có sách nào</td></tr>`;
            return;
        }
        list.forEach((book, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td class="border p-2">${book.title}</td>
        <td class="border p-2">${book.author}</td>
        <td class="border p-2">${book.status}</td>
        <td class="border p-2">${book.year}</td>
        <td class="border p-2">${book.rating}</td>
        <td class="border p-2">${book.note}</td>
        <td class="border p-2">${book.genre}</td>
        <td class="border p-2 text-center">
          <button onclick="bookManager.editBook(${i})" class="text-blue-600">✏️</button>
          <button onclick="bookManager.deleteBook(${i})" class="text-red-600 ml-2">🗑</button>
        </td>
      `;
            tbody.appendChild(row);
        });
    }
    // ======= BIỂU ĐỒ & THỐNG KÊ =======
    showStats() {
        const total = this.books.length;
        const read = this.books.filter((b) => b.status === "Đã đọc").length;
        const reading = this.books.filter((b) => b.status === "Đang đọc").length;
        const want = this.books.filter((b) => b.status === "Muốn đọc").length;
        document.getElementById("totalBooks").innerText = total.toString();
        document.getElementById("readCount").innerText = read.toString();
        document.getElementById("readingCount").innerText = reading.toString();
        document.getElementById("wantCount").innerText = want.toString();
        this.makeCharts();
    }
    makeCharts() {
        const ctx = document.getElementById("statusChart");
        const ctx2 = document.getElementById("yearChart");
        if (this.statusChart)
            this.statusChart.destroy();
        if (this.yearChart)
            this.yearChart.destroy();
        const statusData = {
            "Đã đọc": this.books.filter((b) => b.status === "Đã đọc").length,
            "Đang đọc": this.books.filter((b) => b.status === "Đang đọc").length,
            "Muốn đọc": this.books.filter((b) => b.status === "Muốn đọc").length,
        };
        const yearData = {};
        this.books.forEach((b) => {
            yearData[b.year] = (yearData[b.year] || 0) + 1;
        });
        this.statusChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(statusData),
                datasets: [
                    {
                        data: Object.keys(statusData).map((key) => statusData[key]),
                        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
                    },
                ],
            },
        });
        this.yearChart = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: Object.keys(yearData),
                datasets: [
                    {
                        label: "Sách theo năm",
                        data: Object.keys(yearData).map((key) => yearData[Number(key)]),
                        backgroundColor: "#673ab7",
                    },
                ],
            },
        });
    }
    // ======= NHẬP / XUẤT FILE =======
    exportJSON() {
        const blob = new Blob([JSON.stringify(this.books, null, 2)], { type: "application/json" });
        this.downloadFile(blob, "books.json");
    }
    exportCSV() {
        const header = "Tên,Tác giả,Năm,Trạng thái,Đánh giá,Ghi chú,Thể loại\n";
        const rows = this.books
            .map((b) => `${b.title},${b.author},${b.year},${b.status},${b.rating},${b.note},${b.genre}`)
            .join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        this.downloadFile(blob, "books.csv");
    }
    downloadFile(blob, name) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
    }
    importFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            try {
                const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                this.books = JSON.parse(content);
                this.saveToLocal();
                this.showBooks();
                this.showStats();
                this.toast("📥 Nhập file thành công!");
            }
            catch (_b) {
                this.toast("⚠️ File không hợp lệ!");
            }
        };
        reader.readAsText(file);
    }
    // ======= DỌN FORM =======
    clearForm() {
        document.getElementById("title").value = "";
        document.getElementById("author").value = "";
        document.getElementById("year").value = "";
        document.getElementById("rating").value = "";
        document.getElementById("note").value = "";
        document.getElementById("genre").value = "";
    }
    // ======= TOASTIFY =======
    toast(msg) {
        Toastify({
            text: msg,
            duration: 2000,
            gravity: "bottom",
            position: "center",
            style: {
                background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                color: "#fff",
                borderRadius: "8px",
                fontWeight: "500",
                padding: "10px 15px",
            },
        }).showToast();
    }
}
// ======= KHỞI TẠO =======
const bookManager = new BookManager();
// ======= SỰ KIỆN =======
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearAll");
const search = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const filterGenre = document.getElementById("filterGenre");
const sort = document.getElementById("sortSelect");
const fileInput = document.getElementById("fileInput");
addBtn.onclick = () => {
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const year = Number(document.getElementById("year").value);
    const status = document.getElementById("status").value;
    const rating = Number(document.getElementById("rating").value);
    const note = document.getElementById("note").value.trim();
    const genre = document.getElementById("genre").value;
    if (!title || !author || !year) {
        bookManager.toast("⚠️ Nhập đầy đủ thông tin!");
        return;
    }
    const newBook = new Book(title, author, year, status, rating, note, genre);
    bookManager.addBook(newBook);
};
clearBtn.onclick = () => bookManager.deleteAll();
function applyFilter() {
    const result = bookManager.filterBooks(search.value, filterStatus.value, filterGenre.value);
    bookManager.sortBooks(sort.value);
    bookManager.showBooks(result);
}
search.oninput = applyFilter;
filterStatus.onchange = applyFilter;
filterGenre.onchange = applyFilter;
sort.onchange = applyFilter;
(_a = document.getElementById("exportJSON")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => bookManager.exportJSON());
(_b = document.getElementById("exportCSV")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => bookManager.exportCSV());
(_c = document.getElementById("importJSON")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => fileInput.click());
fileInput.onchange = () => {
    var _a;
    const file = (_a = fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file)
        bookManager.importFile(file);
};
