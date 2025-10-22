// Khai báo Chart (tải qua <script> trong HTML)
declare const Chart: any;

// Book type
class Book {
  constructor(
    public title: string,
    public author: string,
    public year: number,
    public status: string,
    public rating: number,
    public note: string,
    public genre: string
  ) { }
}

class BookManager {
  private books: Book[] = [];
  private editingIndex: number | null = null;
  private statusChart: any = null;
  private yearChart: any = null;

  constructor() {
    this.loadFromLocalStorage();
    this.bindUI();
    this.renderTable();
    this.updateStats();
  }

  // ================= UI BIND =================
  bindUI() {
    const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
    const clearAllBtn = document.getElementById("clearAll") as HTMLButtonElement;
    const exportJSONBtn = document.getElementById("exportJSON") as HTMLButtonElement;
    const exportCSVBtn = document.getElementById("exportCSV") as HTMLButtonElement;
    const importJSONBtn = document.getElementById("importJSON") as HTMLButtonElement;
    const importCSVBtn = document.getElementById("importCSV") as HTMLButtonElement;
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;

    addBtn.onclick = () => this.handleAddOrUpdate();
    clearAllBtn.onclick = () => this.clearAll();

    exportJSONBtn.onclick = () => this.exportJSON();
    exportCSVBtn.onclick = () => this.exportCSV();

    importJSONBtn.onclick = () => {
      fileInput.accept = ".json,application/json";
      fileInput.value = "";
      fileInput.onchange = (e) => this.handleFileImport(e, "json");
      fileInput.click();
    };

    importCSVBtn.onclick = () => {
      fileInput.accept = ".csv,text/csv";
      fileInput.value = "";
      fileInput.onchange = (e) => this.handleFileImport(e, "csv");
      fileInput.click();
    };

    // Filters / events
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const filterStatus = document.getElementById("filterStatus") as HTMLSelectElement;
    const filterGenre = document.getElementById("filterGenre") as HTMLSelectElement;
    const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;

    const ratingFilter = document.createElement("input");
    ratingFilter.type = "number";
    ratingFilter.placeholder = "Lọc điểm ≥";
    ratingFilter.min = "0";
    ratingFilter.max = "10";
    ratingFilter.style.marginLeft = "8px";
    document.querySelector(".filter-section")?.appendChild(ratingFilter);

    searchInput.oninput = () => this.applyFilters();
    filterStatus.onchange = () => this.applyFilters();
    filterGenre.onchange = () => this.applyFilters();
    sortSelect.onchange = () => this.applyFilters();
    ratingFilter.oninput = () => this.applyFilters();

    // expose ratingFilter reference for applyFilters
    (this as any)._ratingFilter = ratingFilter;
  }

  // ================= CORE: Add / Update =================
  // ================= CORE: Add / Update =================
  handleAddOrUpdate() {
    const title = (document.getElementById("title") as HTMLInputElement).value.trim();
    const author = (document.getElementById("author") as HTMLInputElement).value.trim();
    const year = Number((document.getElementById("year") as HTMLInputElement).value);
    const status = (document.getElementById("status") as HTMLSelectElement).value;
    const rating = Number((document.getElementById("rating") as HTMLInputElement).value) || 0;
    const note = (document.getElementById("note") as HTMLTextAreaElement).value.trim();
    const genre = (document.getElementById("genre") as HTMLSelectElement).value;

    if (!title || !author || !year) {
      alert("Vui lòng nhập đủ thông tin (tên, tác giả, năm)!");
      return;
    }

    const book = new Book(title, author, year, status, rating, note, genre);

    if (this.editingIndex !== null) {
      this.books[this.editingIndex] = book;
      this.editingIndex = null;
      (document.getElementById("addBtn") as HTMLButtonElement).textContent = "➕ Thêm sách";
      this.showPopup("💾 Đã lưu thay đổi!");
    } else {
      this.books.push(book);
      this.showPopup("✅ Đã thêm sách!");
    }

    this.saveToLocalStorage();
    this.renderTable();
    this.updateStats();

    // 👉 THÊM DÒNG NÀY: xóa toàn bộ ô nhập sau khi thêm hoặc sửa
    this.clearForm();
  }

  // 👉 THÊM HÀM NÀY (không thay đổi logic cũ)
  clearForm() {
    (document.getElementById("title") as HTMLInputElement).value = "";
    (document.getElementById("author") as HTMLInputElement).value = "";
    (document.getElementById("year") as HTMLInputElement).value = "";
    (document.getElementById("status") as HTMLSelectElement).value = "";
    (document.getElementById("rating") as HTMLInputElement).value = "";
    (document.getElementById("note") as HTMLTextAreaElement).value = "";
    (document.getElementById("genre") as HTMLSelectElement).value = "";
  }


  editBook(index: number) {
    const b = this.books[index];
    if (!b) return;
    (document.getElementById("title") as HTMLInputElement).value = b.title;
    (document.getElementById("author") as HTMLInputElement).value = b.author;
    (document.getElementById("year") as HTMLInputElement).value = b.year.toString();
    (document.getElementById("status") as HTMLSelectElement).value = b.status;
    (document.getElementById("rating") as HTMLInputElement).value = b.rating.toString();
    (document.getElementById("note") as HTMLTextAreaElement).value = b.note;
    (document.getElementById("genre") as HTMLSelectElement).value = b.genre;

    this.editingIndex = index;
    (document.getElementById("addBtn") as HTMLButtonElement).textContent = "💾 Lưu thay đổi";

    // focus & scroll
    (document.getElementById("title") as HTMLInputElement).focus();
    window.scrollTo({ top: 0, behavior: "smooth" });

    this.showPopup("✏️ Đang chỉnh sửa sách...");
  }

  deleteBook(index: number) {
    if (!confirm("Bạn có chắc muốn xóa sách này?")) return;
    this.books.splice(index, 1);
    this.saveToLocalStorage();
    this.renderTable();
    this.updateStats();
    this.showPopup("🗑 Đã xóa sách!");
  }

  clearAll() {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ danh sách?")) return;
    this.books = [];
    this.saveToLocalStorage();
    this.renderTable();
    this.updateStats();
    this.showPopup("🧹 Đã xóa tất cả sách!");
  }

  // ================= Filters / Render =================
  applyFilters() {
    const keyword = ((document.getElementById("searchInput") as HTMLInputElement).value || "").toLowerCase();
    const status = (document.getElementById("filterStatus") as HTMLSelectElement).value;
    const genre = (document.getElementById("filterGenre") as HTMLSelectElement).value;
    const sort = (document.getElementById("sortSelect") as HTMLSelectElement).value;
    const ratingMin = Number((this as any)._ratingFilter.value) || 0;

    let list = this.searchAndFilter(keyword, status, ratingMin, genre);
    if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    this.renderTable(list);
  }

  searchAndFilter(keyword: string, status: string, ratingMin: number, genre: string) {
    return this.books.filter((book) => {
      const matchKeyword =
        !keyword ||
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword) ||
        book.year.toString().includes(keyword);

      const matchStatus = !status || book.status === status;
      const matchGenre = !genre || book.genre === genre;
      const matchRating = isNaN(ratingMin) || book.rating >= ratingMin;
      return matchKeyword && matchStatus && matchGenre && matchRating;
    });
  }

  renderTable(filteredBooks: Book[] = this.books) {
    const tbody = document.querySelector("#bookTable tbody") as HTMLElement;
    tbody.innerHTML = "";
    if (!filteredBooks || filteredBooks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#64748b;">Không có sách nào</td></tr>`;
      return;
    }

    filteredBooks.forEach((b, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${this.escapeHtml(b.title)}</td>
        <td>${this.escapeHtml(b.author)}</td>
        <td>${this.escapeHtml(b.status)}</td>
        <td>${b.year}</td>
        <td>${b.rating || "-"}</td>
        <td>${this.escapeHtml(b.note) || "-"}</td>
        <td>${this.escapeHtml(b.genre) || "-"}</td>
        <td>
          <button class="btn-edit" data-idx="${idx}">✏️</button>
          <button class="btn-del" data-idx="${idx}">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach events
    Array.from(document.querySelectorAll(".btn-edit")).forEach((el) =>
      el.addEventListener("click", (ev) => {
        const idx = Number((ev.currentTarget as HTMLElement).getAttribute("data-idx"));
        this.editBook(idx);
      })
    );
    Array.from(document.querySelectorAll(".btn-del")).forEach((el) =>
      el.addEventListener("click", (ev) => {
        const idx = Number((ev.currentTarget as HTMLElement).getAttribute("data-idx"));
        this.deleteBook(idx);
      })
    );
  }

  escapeHtml(str: string) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m] as string));
  }

  updateStats() {
    (document.getElementById("totalBooks") as HTMLElement).textContent = String(this.books.length);
    (document.getElementById("readCount") as HTMLElement).textContent = String(this.books.filter((b) => b.status === "Đã đọc").length);
    (document.getElementById("readingCount") as HTMLElement).textContent = String(this.books.filter((b) => b.status === "Đang đọc").length);
    (document.getElementById("wantCount") as HTMLElement).textContent = String(this.books.filter((b) => b.status === "Muốn đọc").length);
    this.renderCharts();
  }

  // ================= Charts =================
  renderCharts() {
    const ctx1 = document.getElementById("statusChart") as HTMLCanvasElement;
    const ctx2 = document.getElementById("yearChart") as HTMLCanvasElement;
    if (!ctx1 || !ctx2) return;

    if (this.statusChart) { this.statusChart.destroy(); this.statusChart = null; }
    if (this.yearChart) { this.yearChart.destroy(); this.yearChart = null; }

    const statusCounts: Record<string, number> = {};
    const yearCounts: Record<number, number> = {};
    this.books.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      yearCounts[b.year] = (yearCounts[b.year] || 0) + 1;
    });

    const statusLabels = Object.keys(statusCounts);
    const statusData = statusLabels.map((k) => statusCounts[k]);
    this.statusChart = new (window as any).Chart(ctx1, {
      type: "pie",
      data: { labels: statusLabels, datasets: [{ data: statusData, backgroundColor: ["#4caf50", "#2196f3", "#ff9800"] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    const years = Object.keys(yearCounts).map((y) => Number(y)).sort((a, b) => a - b);
    const counts = years.map((y) => yearCounts[y]);
    this.yearChart = new (window as any).Chart(ctx2, {
      type: "bar",
      data: { labels: years.map(String), datasets: [{ label: "Sách theo năm", data: counts, backgroundColor: "#673ab7" }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }

  // ================= LocalStorage =================
  saveToLocalStorage() {
    localStorage.setItem("books", JSON.stringify(this.books));
  }
  loadFromLocalStorage() {
    const raw = localStorage.getItem("books");
    if (raw) {
      try { this.books = JSON.parse(raw); } catch (e) { this.books = []; }
    } else {
      this.books = [];
    }
  }

  // ================= Export =================
  exportJSON() {
    const data = JSON.stringify(this.books, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "books.json";
    a.click();
    URL.revokeObjectURL(a.href);
    this.showPopup("💾 Đã xuất JSON!");
  }

  exportCSV() {
    const header = ["title", "author", "year", "status", "rating", "note", "genre"];
    const rows = this.books.map(b => [b.title, b.author, String(b.year), b.status, String(b.rating), (b.note || "").replace(/[\n\r,]+/g, " "), b.genre]);
    const csv = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "books.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    this.showPopup("📄 Đã xuất CSV!");
  }

  // ================= Import =================
  handleFileImport(evt: Event, kind: "json" | "csv") {
    const input = evt.currentTarget as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      try {
        if (kind === "json") {
          this.importFromJSONText(text);
        } else {
          this.importFromCSVText(text);
        }
      } catch (err) {
        alert("Không thể nhập file: " + (err as any).message);
      } finally {
        input.value = "";
      }
    };
    reader.onerror = () => {
      alert("Lỗi đọc file.");
      input.value = "";
    };
    reader.readAsText(file);
  }

  importFromJSONText(text: string) {
    let parsed: any;
    try { parsed = JSON.parse(text); } catch (e) { throw new Error("JSON không hợp lệ"); }
    if (!Array.isArray(parsed)) throw new Error("File JSON phải là mảng các object sách");

    // Map & validate
    const imported: Book[] = parsed.map((o: any, i: number) => {
      const title = String(o.title || o.titleName || "");
      const author = String(o.author || o.tacgia || "");
      const year = Number(o.year || o.nam || 0);
      const status = String(o.status || "Muốn đọc");
      const rating = Number(o.rating || 0);
      const note = String(o.note || "");
      const genre = String(o.genre || o.theloai || "");
      if (!title || !author || !year) throw new Error(`Dòng ${i + 1}: thiếu trường bắt buộc`);
      return new Book(title, author, year, status, rating, note, genre);
    });

    if (imported.length === 0) { alert("Không có dữ liệu hợp lệ trong file."); return; }

    if (confirm(`Nhập ${imported.length} sách từ file JSON. Bạn muốn ghi đè dữ liệu hiện tại? (Cancel = ghép)`)) {
      this.books = imported;
    } else {
      this.books = this.books.concat(imported);
    }
    this.saveToLocalStorage();
    this.renderTable();
    this.updateStats();
    this.showPopup("✅ Đã nhập JSON!");
  }

  importFromCSVText(text: string) {
    // split lines, handle CRLF
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lines.length === 0) throw new Error("CSV rỗng");
    // Try parse header
    const header = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const rows = lines.slice(1);
    const imported: Book[] = [];

    rows.forEach((line, idx) => {
      // naive CSV parse: split by comma but handle quoted fields
      const cells = this.parseCSVLine(line);
      if (cells.length === 0) return;
      // map by header names if present
      const obj: any = {};
      for (let i = 0; i < cells.length; i++) {
        const key = header[i] || `col${i}`;
        obj[key] = cells[i];
      }
      const title = (obj["title"] || obj["Tên sách"] || obj["name"] || "").toString();
      const author = (obj["author"] || obj["tác giả"] || obj["tacgia"] || "").toString();
      const year = Number(obj["year"] || obj["năm"] || obj["nam"] || 0);
      const status = (obj["status"] || obj["trạng thái"] || "Muốn đọc").toString();
      const rating = Number(obj["rating"] || obj["điểm"] || 0);
      const note = (obj["note"] || obj["ghi chú"] || "").toString();
      const genre = (obj["genre"] || obj["thể loại"] || "").toString();

      if (!title || !author || !year) {
        // skip invalid row
        return;
      }
      imported.push(new Book(title, author, year, status, rating, note, genre));
    });

    if (imported.length === 0) { alert("Không tìm thấy dòng hợp lệ trong CSV."); return; }

    if (confirm(`Nhập ${imported.length} sách từ file CSV. Bạn muốn ghi đè dữ liệu hiện tại? (Cancel = ghép)`)) {
      this.books = imported;
    } else {
      this.books = this.books.concat(imported);
    }
    this.saveToLocalStorage();
    this.renderTable();
    this.updateStats();
    this.showPopup("✅ Đã nhập CSV!");
  }

  // Simple CSV line parser (handles quoted commas)
  parseCSVLine(line: string): string[] {
    const res: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { // escaped quote
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        res.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    res.push(cur.trim());
    return res.map(s => s.replace(/^"|"$/g, ""));
  }

  // ================= Popup =================
  showPopup(msg: string) {
    const p = document.getElementById("popup");
    if (!p) return;
    p.textContent = msg;
    p.style.display = "block";
    setTimeout(() => { p.style.display = "none"; }, 1800);
  }
}

// expose
const bookManager = new BookManager();
(window as any).bookManager = bookManager;
