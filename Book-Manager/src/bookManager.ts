import { Book } from "./types";

// ==================== QUẢN LÝ DANH SÁCH SÁCH ====================
// Lớp quản lý tất cả sách: thêm, xóa, sửa, load/save localStorage
export class BookManager {
  private books: Book[] = []; // Mảng lưu tất cả sách

  constructor() {
    this.load(); // ✅ Load dữ liệu từ localStorage khi khởi tạo
  }

  // Thêm sách mới
  addBook(book: Book) {
    this.books.push(book);
    this.save();
  }

  // Lấy toàn bộ sách
  getBooks(): Book[] {
    return this.books;
  }

  // Xóa sách theo tên
  deleteBook(title: string) {
    this.books = this.books.filter((b) => b.title !== title);
    this.save();
  }

  // Cập nhật sách cũ thành sách mới
  updateBook(oldTitle: string, newBook: Book) {
    const index = this.books.findIndex((b) => b.title === oldTitle);
    if (index >= 0) {
      this.books[index] = newBook;
      this.save();
    }
  }

  // Xóa toàn bộ sách
  clearAll() {
    this.books = [];
    this.save();
  }

  // Nhập danh sách sách từ mảng dữ liệu
  importBooks(data: Book[]) {
    this.books = data;
    this.save();
  }

  // ==================== LƯU / LOAD LOCALSTORAGE ====================
  private save() {
    localStorage.setItem("books", JSON.stringify(this.books));
  }

  load() {
    const data = localStorage.getItem("books");
    this.books = data ? JSON.parse(data) : [];
  }

  // ==================== THỐNG KÊ ====================
  getStats() {
    return this.books.reduce<Record<string, number>>(
      (acc, book) => {
        if (acc[book.status] !== undefined) acc[book.status]++;
        return acc;
      },
      { "Đã đọc": 0, "Đang đọc": 0, "Muốn đọc": 0 }
    );
  }

  // ==================== LẤY TOP BOOKS (gợi ý nổi bật) ====================
  getTopBooks(count: number = 3): Book[] {
    return [...this.books]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count);
  }
}
