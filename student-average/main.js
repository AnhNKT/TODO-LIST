var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
var students = [];
// ========== Hàm tiện ích ==========
function uid() {
    return Math.random().toString(36).substring(2, 9);
}
function calcAverage(scores) {
    var total = scores.reduce(function (a, b) { return a + b; }, 0);
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
    var data = localStorage.getItem("students");
    if (data) {
        // ✅ Fix: parse JSON và đảm bảo kiểu dữ liệu đúng
        students = JSON.parse(data).map(function (s) { return (__assign(__assign({}, s), { math: Number(s.math), physics: Number(s.physics), chemistry: Number(s.chemistry), average: Number(s.average) })); });
    }
}
function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("math").value = "";
    document.getElementById("physics").value = "";
    document.getElementById("chemistry").value = "";
    var addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Thêm học sinh";
    delete addBtn.dataset.editId;
}
// ========== Hiển thị danh sách ==========
function renderTable() {
    var tbody = document.querySelector("#studentTable tbody");
    if (!tbody)
        return; // ✅ Bảo vệ null
    tbody.innerHTML = "";
    students.forEach(function (s) {
        var _a, _b;
        if (!s.name || isNaN(s.math) || isNaN(s.physics) || isNaN(s.chemistry))
            return;
        var tr = document.createElement("tr");
        tr.innerHTML = "\n      <td>".concat(s.name, "</td>\n      <td>").concat(s.math, "</td>\n      <td>").concat(s.physics, "</td>\n      <td>").concat(s.chemistry, "</td>\n      <td>").concat(s.average.toFixed(2), "</td>\n      <td>").concat(s.rank, "</td>\n      <td>\n        <button class=\"btn-edit\">S\u1EEDa</button>\n        <button class=\"btn-delete\">X\u00F3a</button>\n      </td>\n    ");
        tbody.appendChild(tr);
        // ✅ Fix: gắn lại event mỗi lần render
        (_a = tr.querySelector(".btn-edit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () { return startEdit(s.id); });
        (_b = tr.querySelector(".btn-delete")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () { return deleteStudent(s.id); });
    });
}
// ========== Cập nhật thống kê ==========
function renderStats() {
    var total = students.length;
    var avgAll = total ? calcAverage(students.map(function (s) { return s.average; })) : 0;
    var totalEl = document.getElementById("totalStudents");
    var avgEl = document.getElementById("avgAll");
    if (totalEl)
        totalEl.textContent = total.toString();
    if (avgEl)
        avgEl.textContent = avgAll.toFixed(2);
}
// ========== Thêm hoặc sửa ==========
(_a = document.getElementById("addBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    var name = document.getElementById("name").value.trim();
    var math = parseFloat(document.getElementById("math").value);
    var physics = parseFloat(document.getElementById("physics").value);
    var chemistry = parseFloat(document.getElementById("chemistry").value);
    if (!name || [math, physics, chemistry].some(function (v) { return isNaN(v) || v < 0 || v > 10; })) {
        alert("Vui lòng nhập tên và điểm hợp lệ (0–10).");
        return;
    }
    var addBtn = document.getElementById("addBtn");
    var editId = addBtn.dataset.editId;
    var avg = calcAverage([math, physics, chemistry]);
    var rank = classify(avg);
    if (editId) {
        var idx = students.findIndex(function (s) { return s.id === editId; });
        if (idx !== -1) {
            // ✅ Fix: ép kiểu rõ ràng để tránh TS báo đỏ
            var oldStudent = students[idx];
            students[idx] = __assign(__assign({}, oldStudent), { name: name, math: math, physics: physics, chemistry: chemistry, average: avg, rank: rank });
        }
    }
    else {
        students.push({ id: uid(), name: name, math: math, physics: physics, chemistry: chemistry, average: avg, rank: rank });
    }
    saveData();
    renderTable();
    renderStats();
    resetForm();
});
// ========== Sửa học sinh ==========
function startEdit(id) {
    var s = students.find(function (x) { return x.id === id; });
    if (!s)
        return;
    document.getElementById("name").value = s.name;
    document.getElementById("math").value = s.math.toString();
    document.getElementById("physics").value = s.physics.toString();
    document.getElementById("chemistry").value = s.chemistry.toString();
    var addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Lưu thay đổi";
    addBtn.dataset.editId = id;
}
// ========== Xóa học sinh ==========
function deleteStudent(id) {
    if (!confirm("Bạn có chắc muốn xóa học sinh này?"))
        return;
    var idx = students.findIndex(function (s) { return s.id === id; });
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
