// ===================== KHAI BÁO KIỂU DỮ LIỆU =====================

interface Student {
  id: string;
  name: string;
  math: number;
  physics: number;
  chemistry: number;
  average: number;
  rank: RankKeys;
}

type RankKeys = "Giỏi" | "Khá" | "Trung Bình" | "Yếu";

let students: Student[] = [];


// ===================== HÀM TIỆN ÍCH =====================

// Sinh ID ngẫu nhiên
function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Tính trung bình
function calcAverage(scores: number[]): number {
  const total = scores.reduce((a, b) => a + b, 0);
  return parseFloat((total / scores.length).toFixed(2));
}

// Phân loại học sinh
function classify(avg: number): RankKeys {
  if (avg >= 8) return "Giỏi";
  if (avg >= 6.5) return "Khá";
  if (avg >= 5) return "Trung Bình";
  return "Yếu";
}

// Lưu và tải dữ liệu LocalStorage
function saveData(): void {
  localStorage.setItem("students", JSON.stringify(students));
}

function loadData(): void {
  const data = localStorage.getItem("students");
  if (data) {
    students = JSON.parse(data).map((s: any) => ({
      ...s,
      math: Number(s.math),
      physics: Number(s.physics),
      chemistry: Number(s.chemistry),
      average: Number(s.average),
    }));
  }
}

// Reset form
function resetForm(): void {
  (document.getElementById("name") as HTMLInputElement).value = "";
  (document.getElementById("math") as HTMLInputElement).value = "";
  (document.getElementById("physics") as HTMLInputElement).value = "";
  (document.getElementById("chemistry") as HTMLInputElement).value = "";

  const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
  addBtn.textContent = "Thêm học sinh";
  delete addBtn.dataset.editId;
}


// ===================== HIỂN THỊ DANH SÁCH =====================

function renderTable(keyword: string = ""): void {
  const tbody = document.querySelector("#studentTable tbody") as HTMLElement | null;
  if (!tbody) return;

  tbody.innerHTML = "";

  students
    .filter((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))
    .forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.math}</td>
        <td>${s.physics}</td>
        <td>${s.chemistry}</td>
        <td>${s.average.toFixed(2)}</td>
        <td>${s.rank}</td>
        <td>
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);

      tr.querySelector(".btn-edit")?.addEventListener("click", () => startEdit(s.id));
      tr.querySelector(".btn-delete")?.addEventListener("click", () => deleteStudent(s.id));
    });

  renderAdvancedStats();
}


// ===================== THỐNG KÊ CƠ BẢN =====================

function renderStats(): void {
  const total = students.length;
  const avgAll = total ? calcAverage(students.map((s) => s.average)) : 0;

  const totalEl = document.getElementById("totalStudents");
  const avgEl = document.getElementById("avgAll");

  if (totalEl) totalEl.textContent = total.toString();
  if (avgEl) avgEl.textContent = avgAll.toFixed(2);
}


// ===================== THÊM / SỬA HỌC SINH =====================

document.getElementById("addBtn")?.addEventListener("click", () => {
  const name = (document.getElementById("name") as HTMLInputElement).value.trim();
  const math = parseFloat((document.getElementById("math") as HTMLInputElement).value);
  const physics = parseFloat((document.getElementById("physics") as HTMLInputElement).value);
  const chemistry = parseFloat((document.getElementById("chemistry") as HTMLInputElement).value);

  if (!name || [math, physics, chemistry].some((v) => isNaN(v) || v < 0 || v > 10)) {
    alert("Vui lòng nhập tên và điểm hợp lệ (0–10).");
    return;
  }

  const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
  const editId = addBtn.dataset.editId;

  const avg = calcAverage([math, physics, chemistry]);
  const rank = classify(avg);

  if (editId) {
    const idx = students.findIndex((s) => s.id === editId);
    if (idx !== -1) {
      students[idx] = { ...students[idx], name, math, physics, chemistry, average: avg, rank };
    }
  } else {
    students.push({ id: uid(), name, math, physics, chemistry, average: avg, rank });
  }

  saveData();
  renderTable();
  renderStats();
  resetForm();
});


// ===================== CHỈNH SỬA & XÓA =====================

function startEdit(id: string): void {
  const s = students.find((x) => x.id === id);
  if (!s) return;

  (document.getElementById("name") as HTMLInputElement).value = s.name;
  (document.getElementById("math") as HTMLInputElement).value = s.math.toString();
  (document.getElementById("physics") as HTMLInputElement).value = s.physics.toString();
  (document.getElementById("chemistry") as HTMLInputElement).value = s.chemistry.toString();

  const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
  addBtn.textContent = "Lưu thay đổi";
  addBtn.dataset.editId = id;
}

function deleteStudent(id: string): void {
  if (!confirm("Bạn có chắc muốn xóa học sinh này?")) return;
  students = students.filter((s) => s.id !== id);
  saveData();
  renderTable();
  renderStats();
}


// ===================== TÌM KIẾM =====================

document.getElementById("searchInput")?.addEventListener("input", (e) => {
  const keyword = (e.target as HTMLInputElement).value;
  renderTable(keyword);
});


// ===================== THỐNG KÊ NÂNG CAO =====================

function renderAdvancedStats(): void {
  const ranks: Record<RankKeys, number> = { "Giỏi": 0, "Khá": 0, "Trung Bình": 0, "Yếu": 0 };
  const total = students.length;

  students.forEach((s) => (ranks[s.rank] = (ranks[s.rank] || 0) + 1));

  const statsDiv = document.getElementById("advancedStats");
  if (!statsDiv) return;

  statsDiv.innerHTML = `
    <p>Giỏi: ${ranks["Giỏi"]} (${((ranks["Giỏi"] / total) * 100 || 0).toFixed(1)}%)</p>
    <p>Khá: ${ranks["Khá"]} (${((ranks["Khá"] / total) * 100 || 0).toFixed(1)}%)</p>
    <p>Trung Bình: ${ranks["Trung Bình"]} (${((ranks["Trung Bình"] / total) * 100 || 0).toFixed(1)}%)</p>
    <p>Yếu: ${ranks["Yếu"]} (${((ranks["Yếu"] / total) * 100 || 0).toFixed(1)}%)</p>
  `;

  renderChart(ranks);
}


// ===================== BIỂU ĐỒ =====================

function renderChart(ranks: Record<RankKeys, number>): void {
  const canvas = document.getElementById("chart") as HTMLCanvasElement | null;
  if (!canvas) return;

  const labels = Object.keys(ranks) as RankKeys[];
  const values = labels.map((key) => ranks[key]);

  if ((window as any).chartInstance) (window as any).chartInstance.destroy();

  (window as any).chartInstance = new (window as any).Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Số lượng học sinh",
          data: values,
          backgroundColor: ["#16a34a", "#2563eb", "#facc15", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
    },
  });
}


// ===================== XUẤT DỮ LIỆU =====================

function exportData(type: "csv" | "txt"): void {
  if (students.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const headers = ["Tên", "Toán", "Lý", "Hóa", "Trung bình", "Xếp loại"];
  const rows = students.map((s) => [s.name, s.math, s.physics, s.chemistry, s.average, s.rank]);
  let content = headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

  if (type === "txt") content = content.replace(/,/g, "\t");

  const blob = new Blob([content], { type: type === "csv" ? "text/csv" : "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `students.${type}`;
  a.click();
}


// ===================== GẮN SỰ KIỆN CHO NÚT XUẤT =====================

document.getElementById("btnCSV")?.addEventListener("click", () => exportData("csv"));
document.getElementById("btnTXT")?.addEventListener("click", () => exportData("txt"));


// ===================== KHỞI CHẠY =====================

loadData();
renderTable();
renderStats();
renderAdvancedStats();