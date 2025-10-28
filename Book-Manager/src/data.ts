import { Book } from "./types";

export function exportJSON(books: Book[]) {
  const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "books.json";
  a.click();
}

export function exportCSV(books: Book[]) {
  const header = ["Tên", "Tác giả", "Trạng thái", "Năm", "Đánh giá", "Ghi chú", "Thể loại"];
  const rows = books.map((b) => [b.title, b.author, b.status, b.year, b.rating, b.note, b.genre]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "books.csv";
  a.click();
}
