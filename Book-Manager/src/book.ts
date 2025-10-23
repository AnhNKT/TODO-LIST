// Thông báo cho TypeScript biết có thư viện Chart và Toastify
declare const Chart: any;
declare const Toastify: any;

// ======= CLASS BOOK =======
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

// ======= CLASS BOOK MANAGER =======
class BookManager {
  private books: Book[] = [];
  private editingIndex: number | null = null;
  private statusChart: any = null;
  private yearChart: any = null;

  constructor() {
    this.loadFromLocal();
    this.showBooks();
    this.showStats();
  }

  // ======= THÊM HOẶC CẬP NHẬT SÁCH =======
  addBook(book: Book) {
    if (this.editingIndex !== null) {
      this.books[this.editingIndex] = book;
      this.toast("📘 Đã cập nhật thông tin sách!");
      this.editingIndex = null;
      (document.getElementById("addBtn") as HTMLButtonElement).textContent = "➕ Thêm sách";
    } else {
      this.books.push(book);
      this.toast("✅ Đã thêm sách mới!");
    }
    this.saveToLocal();
    this.showBooks();
    this.showStats();
    this.clearForm();
  }

  // ======= CHỈNH SỬA =======
  editBook(index: number) {
    const book = this.books[index];
    if (!book) return;

    (document.getElementById("title") as HTMLInputElement).value = book.title;
    (document.getElementById("author") as HTMLInputElement).value = book.author;
    (document.getElementById("year") as HTMLInputElement).value = book.year.toString();
    (document.getElementById("status") as HTMLSelectElement).value = book.status;
    (document.getElementById("rating") as HTMLInputElement).value = book.rating.toString();
    (document.getElementById("note") as HTMLTextAreaElement).value = book.note;
    (document.getElementById("genre") as HTMLSelectElement).value = book.genre;

    this.editingIndex = index;
    (document.getElementById("addBtn") as HTMLButtonElement).textContent = "💾 Lưu thay đổi";
    this.toast("✏️ Đang chỉnh sửa sách...");
  }

  // ======= XÓA =======
  deleteBook(index: number) {
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
  filterBooks(keyword: string, status: string, genre: string) {
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
  sortBooks(option: string) {
    if (option === "title") {
      this.books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === "rating") {
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
  showBooks(list: Book[] = this.books) {
    const tbody = document.querySelector("#bookTable tbody") as HTMLElement;
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

    (document.getElementById("totalBooks") as HTMLElement).innerText = total.toString();
    (document.getElementById("readCount") as HTMLElement).innerText = read.toString();
    (document.getElementById("readingCount") as HTMLElement).innerText = reading.toString();
    (document.getElementById("wantCount") as HTMLElement).innerText = want.toString();

    this.makeCharts();
  }

  makeCharts() {
    const ctx = document.getElementById("statusChart") as HTMLCanvasElement;
    const ctx2 = document.getElementById("yearChart") as HTMLCanvasElement;

    if (this.statusChart) this.statusChart.destroy();
    if (this.yearChart) this.yearChart.destroy();

    const statusData = {
      "Đã đọc": this.books.filter((b) => b.status === "Đã đọc").length,
      "Đang đọc": this.books.filter((b) => b.status === "Đang đọc").length,
      "Muốn đọc": this.books.filter((b) => b.status === "Muốn đọc").length,
    };

    const yearData: Record<number, number> = {};
    this.books.forEach((b) => {
      yearData[b.year] = (yearData[b.year] || 0) + 1;
    });

    this.statusChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(statusData),
        datasets: [
          {
            data: Object.keys(statusData).map(
              (key) => statusData[key as keyof typeof statusData]
            ),
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
            data: Object.keys(yearData).map(
              (key) => yearData[Number(key)]
            ),
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

  private downloadFile(blob: Blob, name: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

  importFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        this.books = JSON.parse(content);
        this.saveToLocal();
        this.showBooks();
        this.showStats();
        this.toast("📥 Nhập file thành công!");
      } catch {
        this.toast("⚠️ File không hợp lệ!");
      }
    };
    reader.readAsText(file);
  }

  // ======= DỌN FORM =======
  clearForm() {
    (document.getElementById("title") as HTMLInputElement).value = "";
    (document.getElementById("author") as HTMLInputElement).value = "";
    (document.getElementById("year") as HTMLInputElement).value = "";
    (document.getElementById("rating") as HTMLInputElement).value = "";
    (document.getElementById("note") as HTMLTextAreaElement).value = "";
    (document.getElementById("genre") as HTMLSelectElement).value = "";
  }

  // ======= TOASTIFY =======
  toast(msg: string) {
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
const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
const clearBtn = document.getElementById("clearAll") as HTMLButtonElement;
const search = document.getElementById("searchInput") as HTMLInputElement;
const filterStatus = document.getElementById("filterStatus") as HTMLSelectElement;
const filterGenre = document.getElementById("filterGenre") as HTMLSelectElement;
const sort = document.getElementById("sortSelect") as HTMLSelectElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;

addBtn.onclick = () => {
  const title = (document.getElementById("title") as HTMLInputElement).value.trim();
  const author = (document.getElementById("author") as HTMLInputElement).value.trim();
  const year = Number((document.getElementById("year") as HTMLInputElement).value);
  const status = (document.getElementById("status") as HTMLSelectElement).value;
  const rating = Number((document.getElementById("rating") as HTMLInputElement).value);
  const note = (document.getElementById("note") as HTMLTextAreaElement).value.trim();
  const genre = (document.getElementById("genre") as HTMLSelectElement).value;

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

document.getElementById("exportJSON")?.addEventListener("click", () => bookManager.exportJSON());
document.getElementById("exportCSV")?.addEventListener("click", () => bookManager.exportCSV());
document.getElementById("importJSON")?.addEventListener("click", () => fileInput.click());
fileInput.onchange = () => {
  const file = fileInput.files?.[0];
  if (file) bookManager.importFile(file);
};
