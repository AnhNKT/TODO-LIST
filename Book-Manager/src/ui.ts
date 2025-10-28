import { Book } from "./types";
import { BookManager } from "./bookManager";
import { renderCharts } from "./chart";

const manager = new BookManager();

function showToast(message: string) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

export function initUI() {
    const form = document.getElementById("book-form") as HTMLFormElement;
    const table = document.getElementById("book-table") as HTMLTableSectionElement;
    const summary = document.getElementById("summary") as HTMLParagraphElement;

    const searchInput = document.getElementById("search") as HTMLInputElement;
    const filterStatus = document.getElementById("filter-status") as HTMLSelectElement;
    const filterGenre = document.getElementById("filter-genre") as HTMLSelectElement;
    const sortSelect = document.getElementById("sort") as HTMLSelectElement;
    const yearInput = document.getElementById("filter-year") as HTMLInputElement;
    const minRatingInput = document.getElementById("filter-rating") as HTMLInputElement;

    const exportJSONBtn = document.getElementById("export-json")!;
    const importJSONBtn = document.getElementById("import-json")!;
    const exportCSVBtn = document.getElementById("export-csv")!;
    const importCSVInput = document.getElementById("import-csv") as HTMLInputElement;
    const importCSVBtn = document.getElementById("import-csv-btn")!;
    const clearAllBtn = document.getElementById("clear-all")!;

    const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;

    let currentPage = 1;
    const itemsPerPage = 5;
    const pagination = document.getElementById("pagination") as HTMLDivElement;

    let editingTitle: string | null = null;

    // ==================== FORM SUBMIT ====================
    form.onsubmit = (e) => {
        e.preventDefault();

        const book = new Book(
            (document.getElementById("title") as HTMLInputElement).value,
            (document.getElementById("author") as HTMLInputElement).value,
            (document.getElementById("status") as HTMLSelectElement).value,
            Number((document.getElementById("year") as HTMLInputElement).value),
            Number((document.getElementById("rating") as HTMLInputElement).value),
            (document.getElementById("note") as HTMLInputElement).value,
            (document.getElementById("genre") as HTMLSelectElement).value
        );

        if (editingTitle) {
            manager.updateBook(editingTitle, book);
            showToast(`✏️ Đã cập nhật: ${book.title}`);
            editingTitle = null;
            submitBtn.textContent = "➕ Thêm sách";
        } else {
            manager.addBook(book);
            showToast("📘 Đã thêm sách mới!");
        }

        form.reset();
        renderTable();
    };

    // ==================== FILE ACTIONS ====================
    exportJSONBtn.addEventListener("click", () => {
        const data = JSON.stringify(manager.getBooks(), null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "books.json";
        a.click();
        showToast("💾 Đã xuất JSON!");
    });

    importJSONBtn.addEventListener("click", async () => {
        const [fileHandle] = await (window as any).showOpenFilePicker({
            types: [{ accept: { "application/json": [".json"] } }],
        });
        const file = await fileHandle.getFile();
        const text = await file.text();
        manager.importBooks(JSON.parse(text));
        showToast("📂 Đã nhập JSON!");
        renderTable();
    });

    exportCSVBtn.addEventListener("click", () => {
        const rows = manager.getBooks().map(
            (b) => `${b.title},${b.author},${b.status},${b.year},${b.rating},${b.note},${b.genre}`
        );
        const csv = ["Tên,Tác giả,Trạng thái,Năm,Rating,Ghi chú,Thể loại", ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "books.csv";
        a.click();
        showToast("💾 Đã xuất CSV!");
    });

    importCSVBtn.addEventListener("click", () => importCSVInput.click());
    importCSVInput.addEventListener("change", async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const text = await file.text();
        const lines = text.split("\n").slice(1);
        const books = lines.map((line) => {
            const [title, author, status, year, rating, note, genre] = line.split(",");
            return new Book(title, author, status, Number(year), Number(rating), note, genre);
        });
        manager.importBooks(books);
        showToast("📂 Đã nhập CSV!");
        renderTable();
    });

    clearAllBtn.addEventListener("click", () => {
        manager.clearAll();
        showToast("🧹 Đã xóa toàn bộ sách!");
        renderTable();
    });

    // ==================== RENDER TABLE ====================
    function renderTable() {
        let books = manager.getBooks();
        const search = searchInput.value.toLowerCase();
        const status = filterStatus.value;
        const genre = filterGenre.value.toLowerCase();
        const sort = sortSelect.value;
        const yearFilter = Number(yearInput.value);
        const minRating = Number(minRatingInput.value);

        books = books.filter(
            (b) =>
                (!search || b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search)) &&
                (!status || b.status === status) &&
                (!genre || b.genre.toLowerCase().includes(genre)) &&
                (!yearFilter || b.year >= yearFilter) &&
                (!minRating || b.rating >= minRating)
        );

        switch (sort) {
            case "title": books.sort((a, b) => a.title.localeCompare(b.title)); break;
            case "author": books.sort((a, b) => a.author.localeCompare(b.author)); break;
            case "year": books.sort((a, b) => a.year - b.year); break;
            case "rating": books.sort((a, b) => b.rating - a.rating); break;
        }

        const totalPages = Math.ceil(books.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;
        const start = (currentPage - 1) * itemsPerPage;
        const paginatedBooks = books.slice(start, start + itemsPerPage);

        table.innerHTML = paginatedBooks
            .map(
                (b) => `
            <tr class="fade-in">
                <td class="book-title" data-title="${b.title}">${b.title}</td>
                <td>${b.author}</td>
                <td>${b.status}</td>
                <td>${b.year}</td>
                <td>${b.rating}</td>
                <td>${b.note}</td>
                <td>${b.genre}</td>
                <td>
                    <button class="edit-btn" data-title="${b.title}">✏️</button>
                    <button class="del-btn" data-title="${b.title}">🗑️</button>
                </td>
            </tr>`
            )
            .join("");

        pagination.innerHTML = `
            <button ${currentPage === 1 ? "disabled" : ""} id="prev-page">⬅️ Trước</button>
            <span>Trang ${currentPage}/${totalPages || 1}</span>
            <button ${currentPage === totalPages ? "disabled" : ""} id="next-page">Tiếp ➡️</button>
        `;
        pagination.querySelector("#prev-page")?.addEventListener("click", () => { currentPage--; renderTable(); });
        pagination.querySelector("#next-page")?.addEventListener("click", () => { currentPage++; renderTable(); });

        document.querySelectorAll(".del-btn").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const title = (e.target as HTMLButtonElement).dataset.title!;
                manager.deleteBook(title);
                showToast("🗑️ Đã xóa sách!");
                renderTable();
            })
        );

        document.querySelectorAll(".edit-btn").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const title = (e.target as HTMLButtonElement).dataset.title!;
                const book = manager.getBooks().find((b) => b.title === title);
                if (!book) return;

                (document.getElementById("title") as HTMLInputElement).value = book.title;
                (document.getElementById("author") as HTMLInputElement).value = book.author;
                (document.getElementById("status") as HTMLSelectElement).value = book.status;
                (document.getElementById("year") as HTMLInputElement).value = book.year.toString();
                (document.getElementById("rating") as HTMLInputElement).value = book.rating.toString();
                (document.getElementById("note") as HTMLInputElement).value = book.note;
                (document.getElementById("genre") as HTMLSelectElement).value = book.genre;

                editingTitle = book.title;
                submitBtn.textContent = "💾 Lưu";
                showToast(`✏️ Đang chỉnh sửa: ${book.title}`);
            })
        );

        const stats = manager.getStats();
        summary.textContent = `Tổng: ${books.length} | Đã đọc: ${stats["Đã đọc"]} | Đang đọc: ${stats["Đang đọc"]} | Muốn đọc: ${stats["Muốn đọc"]}`;

        renderCharts(books);
    }

    [searchInput, filterStatus, filterGenre, sortSelect, yearInput, minRatingInput].forEach((el) =>
        el.addEventListener("input", renderTable)
    );

    renderTable();
}
