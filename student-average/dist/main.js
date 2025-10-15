var _a;
let students = [];
// ========== Hàm tiện ích ==========
function uid() {
    return Math.random().toString(36).substring(2, 9);
}
function calcAverage(scores) {
    const total = scores.reduce((a, b) => a + b, 0);
    return parseFloat((total / scores.length).toFixed(2));
}
function classify(avg) {
    if (avg >= 8)
        return "Giỏi";
    if (avg >= 6.5)
        return "Khá";
    if (avg >= 5)
        return "Trung Bình";
    return "Yếu";
}
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}
function loadData() {
    const data = localStorage.getItem("students");
    if (data) {
        // ✅ Fix: parse JSON và đảm bảo kiểu dữ liệu đúng
        students = JSON.parse(data).map((s) => (Object.assign(Object.assign({}, s), { math: Number(s.math), physics: Number(s.physics), chemistry: Number(s.chemistry), average: Number(s.average) })));
    }
}
function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("math").value = "";
    document.getElementById("physics").value = "";
    document.getElementById("chemistry").value = "";
    const addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Thêm học sinh";
    delete addBtn.dataset.editId;
}
// ========== Hiển thị danh sách ==========
function renderTable() {
    const tbody = document.querySelector("#studentTable tbody");
    if (!tbody)
        return; // ✅ Bảo vệ null
    tbody.innerHTML = "";
    students.forEach((s) => {
        var _a, _b;
        if (!s.name || isNaN(s.math) || isNaN(s.physics) || isNaN(s.chemistry))
            return;
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
        // ✅ Fix: gắn lại event mỗi lần render
        (_a = tr.querySelector(".btn-edit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => startEdit(s.id));
        (_b = tr.querySelector(".btn-delete")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => deleteStudent(s.id));
    });
}
// ========== Cập nhật thống kê ==========
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
// ========== Thêm hoặc sửa ==========
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
            // ✅ Fix: ép kiểu rõ ràng để tránh TS báo đỏ
            const oldStudent = students[idx];
            students[idx] = Object.assign(Object.assign({}, oldStudent), { name, math, physics, chemistry, average: avg, rank });
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
// ========== Sửa học sinh ==========
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
// ========== Xóa học sinh ==========
function deleteStudent(id) {
    if (!confirm("Bạn có chắc muốn xóa học sinh này?"))
        return;
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
export {};
//# sourceMappingURL=main.js.map