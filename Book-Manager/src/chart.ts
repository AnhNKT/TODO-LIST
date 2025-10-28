import { Book } from "./types";

// Khai báo Chart từ CDN
declare const Chart: any;

// Lưu lại instance của biểu đồ để có thể xóa trước khi vẽ mới
let statusChartInstance: any = null;
let yearChartInstance: any = null;

export function renderCharts(books: Book[]) {
  const ctx1 = document.getElementById("statusChart") as HTMLCanvasElement;
  const ctx2 = document.getElementById("yearChart") as HTMLCanvasElement;

  if (!ctx1 || !ctx2) return;

  // Nếu đã có biểu đồ cũ thì xóa trước khi vẽ mới
  if (statusChartInstance) statusChartInstance.destroy();
  if (yearChartInstance) yearChartInstance.destroy();

  // ===================== BIỂU ĐỒ TRẠNG THÁI =====================
  const statuses = ["Đã đọc", "Đang đọc", "Muốn đọc"];
  const statusCount = statuses.map((s) => books.filter((b) => b.status === s).length);

  statusChartInstance = new Chart(ctx1, {
    type: "pie",
    data: {
      labels: statuses,
      datasets: [
        {
          data: statusCount,
          backgroundColor: [
            "rgba(34,197,94,0.8)",  // xanh lá
            "rgba(59,130,246,0.8)", // xanh dương
            "rgba(250,204,21,0.8)", // vàng
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "📊 Trạng thái đọc sách",
          color: "#1e293b",
          font: { size: 16, weight: "bold" },
        },
        legend: {
          position: "bottom",
          labels: {
            color: "#475569",
            font: { size: 12 },
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutBounce",
      },
    },
  });

  // ===================== BIỂU ĐỒ NĂM XUẤT BẢN =====================
  const years = Array.from(new Set(books.map((b) => b.year))).sort();
  const yearCount = years.map((y) => books.filter((b) => b.year === y).length);

  yearChartInstance = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: years,
      datasets: [
        {
          label: "Sách xuất bản theo năm",
          data: yearCount,
          backgroundColor: years.map(
            (_, i) => `hsl(${(i * 40) % 360}, 80%, 60%)` // Màu cầu vồng nhẹ theo năm
          ),
          borderRadius: 6,
        },
      ],
    },
    options: {
      scales: {
        x: {
          ticks: { color: "#475569" },
          grid: { color: "rgba(203,213,225,0.3)" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#475569", stepSize: 1 },
          grid: { color: "rgba(203,213,225,0.3)" },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "📅 Số lượng sách theo năm",
          color: "#1e293b",
          font: { size: 16, weight: "bold" },
        },
        legend: { display: false },
      },
      animation: {
        duration: 1200,
        easing: "easeInOutQuart",
      },
    },
  });
}
