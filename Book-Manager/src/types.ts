// ==================== LỚP BOOK ====================
// Đại diện cho 1 quyển sách trong tủ

export class Book {
  title: string;     // Tên sách
  author: string;    // Tác giả
  status: string;    // Trạng thái: "Đã đọc" | "Đang đọc" | "Muốn đọc"
  year: number;      // Năm xuất bản
  rating: number;    // Điểm đánh giá 0-10
  note: string;      // Ghi chú
  genre: string;     // Thể loại

  constructor(
    title: string,
    author: string,
    status: string,
    year: number,
    rating: number,
    note: string,
    genre: string
  ) {
    this.title = title;
    this.author = author;
    this.status = status;
    this.year = year;
    this.rating = rating;
    this.note = note;
    this.genre = genre;
  }
}
