interface Student {
  id: string;
  name: string;
  math: number;
  physics: number;
  chemistry: number;
  average: number;
  rank: string;
}

let students: Student[] = [];

// ========== Hàm tiện ích ==========
function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

function calcAverage(scores: number[]): number {
  const total = scores.reduce((a, b) => a + b, 0);
  return parseFloat((total / scores.length).toFixed(2));
}

function classify(avg: number): string {
  if (avg >= 8) return "Giỏi";
  if (avg >= 6.5) return "Khá";
  if (avg >= 5) return "Trung Bình";
  return "Yếu";
}

function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
}

function loadData() {
  const data = localStorage.getItem("students");
  if (data) {
    try {
      students = JSON.parse(data);
      // ✅ SỬA Ở ĐÂY: đảm bảo dữ liệu có đủ trường và số hợp lệ
      students = students.filter(
        (s) =>
          s &&
          typeof s.name === "string" &&
          !isNaN(s.math) &&
          !isNaN(s.physics) &&
          !isNaN(s.chemistry)
      );
    } catch (e) {
      console.error("Lỗi khi đọc dữ liệu:", e);
      students = [];
    }
  }
}

function resetForm() {
  (document.getElementById("name") as HTMLInputElement).value = "";
  (document.getElementById("math") as HTMLInputElement).value = "";
  (document.getElementById("physics") as HTMLInputElement).value = "";
  (document.getElementById("chemistry") as HTMLInputElement).value = "";

  const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
  addBtn.textContent = "Thêm học sinh";
  delete addBtn.dataset.editId;
}

// ========== Hiển thị danh sách ==========
function renderTable() {
  const tbody = document.querySelector("#studentTable tbody") as HTMLElement;
  tbody.innerHTML = "";

  // ✅ SỬA Ở ĐÂY: chỉ render khi có dữ liệu hợp lệ
  students.forEach((s) => {
    if (!s.name || isNaN(s.average)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.math}</td>
      <td>${s.physics}</td>
      <td>${s.chemistry}</td>
      <td>${s.average}</td>
      <td>${s.rank}</td>
      <td>
        <button class="btn-edit">Sửa</button>
        <button class="btn-delete">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);

    // ✅ Gắn sự kiện sau khi thêm hàng
    tr.querySelector(".btn-edit")?.addEventListener("click", () => startEdit(s.id));
    tr.querySelector(".btn-delete")?.addEventListener("click", () => deleteStudent(s.id));
  });
}

// ========== Cập nhật thống kê ==========
function renderStats() {
  const total = students.length;
  const avgAll = total ? calcAverage(students.map((s) => s.average)) : 0;

  const totalElem = document.getElementById("totalStudents");
  const avgElem = document.getElementById("avgAll");

  // ✅ SỬA Ở ĐÂY: chỉ cập nhật khi phần tử tồn tại
  if (totalElem) totalElem.textContent = total.toString();
  if (avgElem) avgElem.textContent = avgAll.toFixed(2);
}

// ========== Thêm hoặc sửa ==========
document.getElementById("addBtn")?.addEventListener("click", () => {
  const name = (document.getElementById("name") as HTMLInputElement).value.trim();
  const math = parseFloat((document.getElementById("math") as HTMLInputElement).value);
  const physics = parseFloat((document.getElementById("physics") as HTMLInputElement).value);
  const chemistry = parseFloat((document.getElementById("chemistry") as HTMLInputElement).value);

  // ✅ SỬA Ở ĐÂY: kiểm tra hợp lệ kỹ hơn
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
      students[idx] = { ...(students[idx] as Student), name, math, physics, chemistry, average: avg, rank };
    }
  } else {
    students.push({ id: uid(), name, math, physics, chemistry, average: avg, rank });
  }

  saveData();
  renderTable();
  renderStats();
  resetForm();
});

// ========== Sửa học sinh ==========
function startEdit(id: string) {
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

// ========== Xóa học sinh ==========
function deleteStudent(id: string) {
  if (!confirm("Bạn có chắc muốn xóa học sinh này?")) return;

  const idx = students.findIndex((s) => s.id === id);
  if (idx !== -1) {
    students.splice(idx, 1);
    saveData();
    renderTable();
    renderStats();
  }
}

// ========== Khởi chạy ==========
loadData();
renderTable();
renderStats();
