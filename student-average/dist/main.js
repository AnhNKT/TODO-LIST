"use strict";
// ===================== KHAI BÁO KIỂU DỮ LIỆU =====================
var _a, _b, _c, _d;
let students = [];
// ===================== HÀM TIỆN ÍCH =====================
// Sinh ID ngẫu nhiên
function uid() {
    return Math.random().toString(36).substring(2, 9);
}
// Tính trung bình
function calcAverage(scores) {
    const total = scores.reduce((a, b) => a + b, 0);
    return parseFloat((total / scores.length).toFixed(2));
}
// Phân loại học sinh
function classify(avg) {
    if (avg >= 8)
        return "Giỏi";
    if (avg >= 6.5)
        return "Khá";
    if (avg >= 5)
        return "Trung Bình";
    return "Yếu";
}
// Lưu và tải dữ liệu LocalStorage
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}
function loadData() {
    const data = localStorage.getItem("students");
    if (data) {
        students = JSON.parse(data).map((s) => (Object.assign(Object.assign({}, s), { math: Number(s.math), physics: Number(s.physics), chemistry: Number(s.chemistry), average: Number(s.average) })));
    }
}
// Reset form
function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("math").value = "";
    document.getElementById("physics").value = "";
    document.getElementById("chemistry").value = "";
    const addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Thêm học sinh";
    delete addBtn.dataset.editId;
}
// ===================== HIỂN THỊ DANH SÁCH =====================
function renderTable(keyword = "") {
    const tbody = document.querySelector("#studentTable tbody");
    if (!tbody)
        return;
    tbody.innerHTML = "";
    students
        .filter((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))
        .forEach((s) => {
        var _a, _b;
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
        (_a = tr.querySelector(".btn-edit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => startEdit(s.id));
        (_b = tr.querySelector(".btn-delete")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => deleteStudent(s.id));
    });
    renderAdvancedStats();
}
// ===================== THỐNG KÊ CƠ BẢN =====================
function renderStats() {
    const total = students.length;
    const avgAll = total ? calcAverage(students.map((s) => s.average)) : 0;
    const totalEl = document.getElementById("totalStudents");
    const avgEl = document.getElementById("avgAll");
    if (totalEl)
        totalEl.textContent = total.toString();
    if (avgEl)
        avgEl.textContent = avgAll.toFixed(2);
}
// ===================== THÊM / SỬA HỌC SINH =====================
(_a = document.getElementById("addBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const math = parseFloat(document.getElementById("math").value);
    const physics = parseFloat(document.getElementById("physics").value);
    const chemistry = parseFloat(document.getElementById("chemistry").value);
    if (!name || [math, physics, chemistry].some((v) => isNaN(v) || v < 0 || v > 10)) {
        alert("Vui lòng nhập tên và điểm hợp lệ (0–10).");
        return;
    }
    const addBtn = document.getElementById("addBtn");
    const editId = addBtn.dataset.editId;
    const avg = calcAverage([math, physics, chemistry]);
    const rank = classify(avg);
    if (editId) {
        const idx = students.findIndex((s) => s.id === editId);
        if (idx !== -1) {
            students[idx] = Object.assign(Object.assign({}, students[idx]), { name, math, physics, chemistry, average: avg, rank });
        }
    }
    else {
        students.push({ id: uid(), name, math, physics, chemistry, average: avg, rank });
    }
    saveData();
    renderTable();
    renderStats();
    resetForm();
});
// ===================== CHỈNH SỬA & XÓA =====================
function startEdit(id) {
    const s = students.find((x) => x.id === id);
    if (!s)
        return;
    document.getElementById("name").value = s.name;
    document.getElementById("math").value = s.math.toString();
    document.getElementById("physics").value = s.physics.toString();
    document.getElementById("chemistry").value = s.chemistry.toString();
    const addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Lưu thay đổi";
    addBtn.dataset.editId = id;
}
function deleteStudent(id) {
    if (!confirm("Bạn có chắc muốn xóa học sinh này?"))
        return;
    students = students.filter((s) => s.id !== id);
    saveData();
    renderTable();
    renderStats();
}
// ===================== TÌM KIẾM =====================
(_b = document.getElementById("searchInput")) === null || _b === void 0 ? void 0 : _b.addEventListener("input", (e) => {
    const keyword = e.target.value;
    renderTable(keyword);
});
// ===================== THỐNG KÊ NÂNG CAO =====================
function renderAdvancedStats() {
    const ranks = { "Giỏi": 0, "Khá": 0, "Trung Bình": 0, "Yếu": 0 };
    const total = students.length;
    students.forEach((s) => (ranks[s.rank] = (ranks[s.rank] || 0) + 1));
    const statsDiv = document.getElementById("advancedStats");
    if (!statsDiv)
        return;
    statsDiv.innerHTML = `
    <p>Giỏi: ${ranks["Giỏi"]} (${((ranks["Giỏi"] / total) * 100 || 0).toFixed(1)}%)</p>
    <p>Khá: ${ranks["Khá"]} (${((ranks["Khá"] / total) * 100 || 0).toFixed(1)}%)</p>
    <p>Trung Bình: ${ranks["Trung Bình"]} (${((ranks["Trung Bình"] / total) * 100 || 0).toFixed(1)}%)</p>
    <p>Yếu: ${ranks["Yếu"]} (${((ranks["Yếu"] / total) * 100 || 0).toFixed(1)}%)</p>
  `;
    renderChart(ranks);
}
// ===================== BIỂU ĐỒ =====================
function renderChart(ranks) {
    const canvas = document.getElementById("chart");
    if (!canvas)
        return;
    const labels = Object.keys(ranks);
    const values = labels.map((key) => ranks[key]);
    if (window.chartInstance)
        window.chartInstance.destroy();
    window.chartInstance = new window.Chart(canvas, {
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
function exportData(type) {
    if (students.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }
    const headers = ["Tên", "Toán", "Lý", "Hóa", "Trung bình", "Xếp loại"];
    const rows = students.map((s) => [s.name, s.math, s.physics, s.chemistry, s.average, s.rank]);
    let content = headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");
    if (type === "txt")
        content = content.replace(/,/g, "\t");
    const blob = new Blob([content], { type: type === "csv" ? "text/csv" : "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `students.${type}`;
    a.click();
}
// ===================== GẮN SỰ KIỆN CHO NÚT XUẤT =====================
(_c = document.getElementById("btnCSV")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => exportData("csv"));
(_d = document.getElementById("btnTXT")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => exportData("txt"));
// ===================== KHỞI CHẠY =====================
loadData();
renderTable();
renderStats();
renderAdvancedStats();
