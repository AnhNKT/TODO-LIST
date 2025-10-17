"use strict";
// ===================== STATE =====================
let students = [];
let barChartInstance = null;
let pieChartInstance = null;
// ===================== UTILITIES =====================
const uid = () => Math.random().toString(36).substring(2, 9);
const calcAverage = (scores) => {
    const total = scores.reduce((a, b) => a + b, 0);
    return parseFloat((total / scores.length).toFixed(2));
};
const classify = (avg) => {
    if (avg >= 8)
        return "Giỏi";
    if (avg >= 6.5)
        return "Khá";
    if (avg >= 5)
        return "Trung Bình";
    return "Yếu";
};
const saveData = () => {
    localStorage.setItem("students", JSON.stringify(students));
};
const loadData = () => {
    const d = localStorage.getItem("students");
    if (d) {
        students = JSON.parse(d).map((s) => (Object.assign(Object.assign({}, s), { math: Number(s.math), physics: Number(s.physics), chemistry: Number(s.chemistry), average: Number(s.average) })));
    }
};
// Theme helpers
const saveTheme = (isDark) => localStorage.setItem("themeDark", isDark ? "1" : "0");
const loadTheme = () => localStorage.getItem("themeDark") === "1";
// ===================== BASIC HELPERS (DEFINE EARLY) =====================
function resetForm() {
    const nameEl = document.getElementById("name");
    const mathEl = document.getElementById("math");
    const physEl = document.getElementById("physics");
    const chemEl = document.getElementById("chemistry");
    const addBtn = document.getElementById("addBtn");
    if (nameEl)
        nameEl.value = "";
    if (mathEl)
        mathEl.value = "";
    if (physEl)
        physEl.value = "";
    if (chemEl)
        chemEl.value = "";
    if (addBtn) {
        addBtn.textContent = "Thêm học sinh";
        delete addBtn.dataset.editId;
    }
}
function getSearchValue() {
    const el = document.getElementById("searchInput");
    return el ? el.value.trim() : "";
}
function getFilterValue() {
    const el = document.getElementById("filterRank");
    return el ? el.value : "";
}
// ===================== RENDERING (TABLE / STATS / CHARTS) =====================
function renderTable(keyword = "", filterRank = "") {
    const tbody = document.querySelector("#studentTable tbody");
    if (!tbody)
        return;
    const list = students
        .filter((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))
        .filter((s) => (filterRank ? s.rank === filterRank : true));
    tbody.innerHTML = list
        .map((s) => `<tr>
      <td>${s.name}</td>
      <td>${s.math}</td>
      <td>${s.physics}</td>
      <td>${s.chemistry}</td>
      <td>${s.average.toFixed(2)}</td>
      <td>${s.rank}</td>
      <td>
        <button class="btn-edit" data-id="${s.id}">Sửa</button>
        <button class="btn-delete" data-id="${s.id}">Xóa</button>
      </td>
    </tr>`)
        .join("");
    // Attach handlers
    const editBtns = Array.from(document.querySelectorAll("#studentTable .btn-edit"));
    editBtns.forEach((el) => el.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        startEdit(id);
    }));
    const delBtns = Array.from(document.querySelectorAll("#studentTable .btn-delete"));
    delBtns.forEach((el) => el.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        deleteStudent(id);
    }));
    renderStats();
    renderAdvancedStats();
    renderTopStudents();
}
function renderStats() {
    const total = students.length;
    const avgAll = total ? calcAverage(students.map((s) => s.average)) : 0;
    const totalEl = document.getElementById("totalStudents");
    const avgEl = document.getElementById("avgAll");
    if (totalEl)
        totalEl.textContent = String(total);
    if (avgEl)
        avgEl.textContent = avgAll.toFixed(2);
}
function renderAdvancedStats() {
    const ranks = { "Giỏi": 0, "Khá": 0, "Trung Bình": 0, "Yếu": 0 };
    students.forEach((s) => (ranks[s.rank] = (ranks[s.rank] || 0) + 1));
    const total = students.length || 1;
    const setProg = (idProg, idText, count) => {
        const percent = total ? (count / total) * 100 : 0;
        const prog = document.getElementById(idProg);
        const txt = document.getElementById(idText);
        if (prog)
            prog.value = Number(percent.toFixed(1));
        if (txt)
            txt.textContent = `${count} (${percent.toFixed(1)}%)`;
    };
    setProg("pExcellent", "nExcellent", ranks["Giỏi"]);
    setProg("pGood", "nGood", ranks["Khá"]);
    setProg("pAverage", "nAverage", ranks["Trung Bình"]);
    setProg("pWeak", "nWeak", ranks["Yếu"]);
    renderCharts(ranks);
}
function renderTopStudents() {
    const top = [...students].sort((a, b) => b.average - a.average).slice(0, 5);
    const el = document.getElementById("topStudents");
    if (!el)
        return;
    if (top.length === 0) {
        el.innerHTML = "<p>Chưa có dữ liệu</p>";
        return;
    }
    el.innerHTML = `<h3>Top 5 học sinh</h3>` + top.map((s, i) => `<p>${i + 1}. ${s.name} — ${s.average.toFixed(2)}</p>`).join("");
}
function renderCharts(ranks) {
    const labels = Object.keys(ranks);
    const values = labels.map((k) => ranks[k]);
    const barCanvas = document.getElementById("barChart");
    const pieCanvas = document.getElementById("pieChart");
    if (barCanvas) {
        if (barChartInstance)
            barChartInstance.destroy();
        barChartInstance = new window.Chart(barCanvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{ label: "Số lượng", data: values, backgroundColor: ["#16a34a", "#2563eb", "#facc15", "#ef4444"] }],
            },
            options: { responsive: true, plugins: { legend: { display: false } } },
        });
    }
    if (pieCanvas) {
        if (pieChartInstance)
            pieChartInstance.destroy();
        pieChartInstance = new window.Chart(pieCanvas, {
            type: "pie",
            data: { labels, datasets: [{ data: values, backgroundColor: ["#16a34a", "#2563eb", "#facc15", "#ef4444"] }] },
            options: { responsive: true },
        });
    }
}
// ===================== CRUD =====================
function addOrUpdateStudentFromForm() {
    const nameEl = document.getElementById("name");
    const mathEl = document.getElementById("math");
    const physEl = document.getElementById("physics");
    const chemEl = document.getElementById("chemistry");
    const addBtn = document.getElementById("addBtn");
    if (!nameEl || !mathEl || !physEl || !chemEl || !addBtn)
        return;
    const name = nameEl.value.trim();
    const math = parseFloat(mathEl.value);
    const physics = parseFloat(physEl.value);
    const chemistry = parseFloat(chemEl.value);
    if (!name || [math, physics, chemistry].some((v) => isNaN(v) || v < 0 || v > 10)) {
        alert("Vui lòng nhập tên và điểm hợp lệ (0–10).");
        return;
    }
    const avg = calcAverage([math, physics, chemistry]);
    const rank = classify(avg);
    const editId = addBtn.dataset.editId;
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
    resetForm();
    renderTable(getSearchValue(), getFilterValue());
}
function startEdit(id) {
    const s = students.find((x) => x.id === id);
    if (!s)
        return;
    document.getElementById("name").value = s.name;
    document.getElementById("math").value = String(s.math);
    document.getElementById("physics").value = String(s.physics);
    document.getElementById("chemistry").value = String(s.chemistry);
    const addBtn = document.getElementById("addBtn");
    if (addBtn) {
        addBtn.textContent = "Lưu thay đổi";
        addBtn.dataset.editId = id;
    }
}
function deleteStudent(id) {
    if (!confirm("Bạn có chắc muốn xóa học sinh này?"))
        return;
    students = students.filter((s) => s.id !== id);
    saveData();
    renderTable(getSearchValue(), getFilterValue());
}
// ===================== IMPORT / EXPORT =====================
function exportData(type) {
    if (students.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }
    const headers = ["Tên", "Toán", "Lý", "Hóa", "Trung bình", "Xếp loại"];
    const rows = students.map((s) => [s.name, s.math, s.physics, s.chemistry, s.average.toFixed(2), s.rank]);
    let content = headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");
    if (type === "txt")
        content = content.replace(/,/g, "\t");
    const blob = new Blob([content], { type: type === "csv" ? "text/csv" : "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `students.${type}`;
    a.click();
    URL.revokeObjectURL(a.href);
}
function importCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        var _a;
        const text = (_a = ev.target) === null || _a === void 0 ? void 0 : _a.result;
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0)
            return;
        const firstCols = lines[0].split(",").map((c) => c.trim());
        const hasHeader = isNaN(Number(firstCols[1]));
        const dataLines = hasHeader ? lines.slice(1) : lines;
        dataLines.forEach((ln) => {
            const cols = ln.split(",").map((c) => c.trim());
            if (cols.length >= 4) {
                const name = cols[0];
                const math = Number(cols[1]);
                const physics = Number(cols[2]);
                const chemistry = Number(cols[3]);
                if ([math, physics, chemistry].some((v) => isNaN(v) || v < 0 || v > 10))
                    return;
                const avg = calcAverage([math, physics, chemistry]);
                const rank = classify(avg);
                students.push({ id: uid(), name, math, physics, chemistry, average: avg, rank });
            }
        });
        saveData();
        renderTable(getSearchValue(), getFilterValue());
    };
    reader.readAsText(file);
}
// ===================== MISC HELPERS =====================
function clearAll() {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ danh sách?"))
        return;
    students = [];
    saveData();
    renderTable();
}
function sortByName() {
    students.sort((a, b) => a.name.localeCompare(b.name));
    renderTable(getSearchValue(), getFilterValue());
}
function sortByAverageDesc() {
    students.sort((a, b) => b.average - a.average);
    renderTable(getSearchValue(), getFilterValue());
}
// ===================== THEME =====================
function setupTheme() {
    const isDark = loadTheme();
    if (isDark)
        document.body.classList.add("dark");
    const btn = document.getElementById("btnTheme");
    if (btn) {
        btn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            saveTheme(document.body.classList.contains("dark"));
        });
    }
}
// ===================== BIND EVENTS =====================
function bindEvents() {
    const addBtn = document.getElementById("addBtn");
    if (addBtn)
        addBtn.addEventListener("click", addOrUpdateStudentFromForm);
    const search = document.getElementById("searchInput");
    if (search)
        search.addEventListener("input", () => renderTable(getSearchValue(), getFilterValue()));
    const filterRank = document.getElementById("filterRank");
    if (filterRank)
        filterRank.addEventListener("change", () => renderTable(getSearchValue(), getFilterValue()));
    const sortNameBtn = document.getElementById("sortName");
    if (sortNameBtn)
        sortNameBtn.addEventListener("click", sortByName);
    const sortAvgBtn = document.getElementById("sortAvg");
    if (sortAvgBtn)
        sortAvgBtn.addEventListener("click", sortByAverageDesc);
    const clearAllBtn = document.getElementById("btnClearAll");
    if (clearAllBtn)
        clearAllBtn.addEventListener("click", clearAll);
    const csvBtn = document.getElementById("btnCSV");
    if (csvBtn)
        csvBtn.addEventListener("click", () => exportData("csv"));
    const txtBtn = document.getElementById("btnTXT");
    if (txtBtn)
        txtBtn.addEventListener("click", () => exportData("txt"));
    const importFileEl = document.getElementById("importFile");
    if (importFileEl) {
        importFileEl.addEventListener("change", (e) => {
            var _a;
            const f = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (f)
                importCSVFile(f);
            e.target.value = "";
        });
    }
}
// ===================== BOOTSTRAP =====================
function bootstrap() {
    loadData();
    setupTheme();
    bindEvents();
    renderTable();
}
bootstrap();
