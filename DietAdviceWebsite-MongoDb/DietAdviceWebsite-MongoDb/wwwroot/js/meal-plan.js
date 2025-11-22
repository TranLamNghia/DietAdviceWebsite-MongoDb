// --- 1. CONFIG & DATA ---
const DAILY_TARGET = 2000;
const TIME_CONFIG = {
    breakfast: { end: 10 },
    lunch: { end: 14 },
    dinner: { end: 22 }
};

let mealData = {
    breakfast: [
        { id: 101, name: "Phở Bò Tái", cal: 450, pro: 20, selected: true },
        { id: 102, name: "Bánh Mì Ốp La", cal: 400, pro: 15, selected: false },
        { id: 103, name: "Yến Mạch & Sữa", cal: 300, pro: 10, selected: false }
    ],
    lunch: [
        { id: 201, name: "Cơm Gà Xối Mỡ", cal: 650, pro: 30, selected: true },
        { id: 202, name: "Salad Cá Ngừ", cal: 350, pro: 25, selected: false },
        { id: 203, name: "Bún Chả", cal: 550, pro: 20, selected: false }
    ],
    dinner: [
        { id: 301, name: "Ức Gà Luộc & Rau", cal: 350, pro: 35, selected: true },
        { id: 302, name: "Cá Hồi Áp Chảo", cal: 400, pro: 30, selected: false }
    ]
};

let snacks = [];

const foodDatabase = [
    { name: "Cơm Trắng", cal: 200, pro: 4, unit: "chén" },
    { name: "Trứng Luộc", cal: 70, pro: 6, unit: "quả" },
    { name: "Chuối", cal: 100, pro: 1, unit: "quả" },
    { name: "Sữa Chua", cal: 100, pro: 5, unit: "hộp" },
    { name: "Bánh Bao", cal: 250, pro: 8, unit: "cái" },
    { name: "Canh Rau", cal: 50, pro: 2, unit: "bát" },
    { name: "Bánh Mì", cal: 250, pro: 8, unit: "ổ" },
    { name: "Khoai Lang", cal: 180, pro: 2, unit: "củ" }
];

// --- 2. INIT ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("currentDateDisplay").innerText =
        new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

    renderAllMeals();
    renderSnacks();
    updateSummary();
    setupModalSearch();
});

// --- 3. RENDER LOGIC ---
function renderAllMeals() {
    const currentHour = new Date().getHours();

    ['breakfast', 'lunch', 'dinner'].forEach(type => {
        const grid = document.getElementById(`grid-${type}`);
        grid.innerHTML = "";

        const isLocked = currentHour >= TIME_CONFIG[type].end;
        const section = document.getElementById(`section-${type}`);

        if (isLocked) section.classList.add('locked');
        else section.classList.remove('locked');

        mealData[type].forEach(item => {
            const card = document.createElement("div");
            card.className = `meal-card ${item.selected ? 'selected' : ''}`;

            if (!isLocked) {
                card.onclick = () => toggleSelection(type, item.id);
            }

            card.innerHTML = `
                <span class="meal-name">${item.name}</span>
                <span class="meal-info">${item.cal} kcal &bull; ${item.pro}g Pro</span>
            `;
            grid.appendChild(card);
        });
    });
}

function renderSnacks() {
    const list = document.getElementById("snackList");
    list.innerHTML = "";

    if (snacks.length === 0) {
        list.innerHTML = `<p class="empty-text" style="color:#aaa; font-style:italic;">Chưa có bữa phụ nào.</p>`;
        return;
    }

    snacks.forEach((snack, idx) => {
        const chip = document.createElement("div");
        chip.className = "snack-chip";
        chip.innerHTML = `
            ${snack.name} (${snack.cal} kcal)
            <span class="remove-snack" onclick="removeSnack(${idx})">&times;</span>
        `;
        list.appendChild(chip);
    });
}

// --- 4. INTERACTION ---
function toggleSelection(type, id) {
    const item = mealData[type].find(m => m.id === id);
    if (item) {
        item.selected = !item.selected;
        renderAllMeals();
        updateSummary();
    }
}

function removeSnack(index) {
    if (confirm("Xóa món ăn vặt này?")) {
        snacks.splice(index, 1);
        renderSnacks();
        updateSummary();
    }
}

function updateSummary() {
    let totalConsumed = 0;
    Object.keys(mealData).forEach(type => {
        mealData[type].forEach(item => {
            if (item.selected) totalConsumed += item.cal;
        });
    });
    snacks.forEach(s => totalConsumed += s.cal);

    const remaining = DAILY_TARGET - totalConsumed;

    document.getElementById("goalCalories").innerText = DAILY_TARGET;
    document.getElementById("consumedCalories").innerText = totalConsumed;

    const remEl = document.getElementById("remainingCalories");
    remEl.innerText = remaining;

    const statusEl = document.getElementById("dayStatus");
    if (remaining < 0) {
        remEl.parentElement.classList.add("warning");
        statusEl.className = "status-badge over";
        statusEl.innerText = "Thừa calo!";
    } else {
        remEl.parentElement.classList.remove("warning");
        statusEl.className = "status-badge good";
        statusEl.innerText = "Ổn định";
    }

    // Dinner Alert
    const currentHour = new Date().getHours();
    if (currentHour < 18 && remaining < 300) {
        document.getElementById("dinner-alert").style.display = "block";
        document.getElementById("dinner-remaining").innerText = remaining > 0 ? remaining : 0;
    } else {
        document.getElementById("dinner-alert").style.display = "none";
    }
}

// --- 5. MODAL LOGIC (FIXED) ---
let currentModalType = '';
let selectedFood = null;

function openAddModal(type) {
    currentModalType = type;
    document.getElementById("addFoodModal").classList.add("show");

    // Reset Form chính xác theo ID trong HTML
    document.getElementById("modalSearchInput").value = "";
    document.getElementById("modalSuggestions").innerHTML = "";
    document.getElementById("modalSuggestions").style.display = "none";
    document.getElementById("selectedItemDetails").style.display = "none";

    // Focus vào ô tìm kiếm
    setTimeout(() => document.getElementById("modalSearchInput").focus(), 100);
}

function closeModal() {
    document.getElementById("addFoodModal").classList.remove("show");
}

// Setup Search
function setupModalSearch() {
    const input = document.getElementById("modalSearchInput");
    const suggestions = document.getElementById("modalSuggestions");

    input.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        suggestions.innerHTML = "";

        if (val.length < 1) {
            suggestions.style.display = "none";
            return;
        }

        const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(val));

        if (matches.length > 0) {
            suggestions.style.display = "block";
            matches.forEach(food => {
                const div = document.createElement("div");
                div.className = "suggestion-item";
                div.innerHTML = `<b>${food.name}</b> <span style='color:#999; font-size:0.8rem'>${food.cal} kcal/${food.unit}</span>`;
                div.onclick = () => selectFoodFromSearch(food);
                suggestions.appendChild(div);
            });
        } else {
            suggestions.style.display = "none";
        }
    });
}

function selectFoodFromSearch(food) {
    selectedFood = food;
    document.getElementById("modalSuggestions").style.display = "none";
    document.getElementById("modalSearchInput").value = food.name;

    document.getElementById("selectedItemDetails").style.display = "block";
    document.getElementById("selName").innerText = food.name;
    document.getElementById("selCal").innerText = food.cal;
    document.getElementById("selPro").innerText = food.pro;
    document.getElementById("selUnit").innerText = food.unit;
    document.getElementById("selQty").value = 1;

    updatePreview();
}

document.getElementById("selQty").addEventListener("input", updatePreview);

function updatePreview() {
    if (!selectedFood) return;
    const qty = parseFloat(document.getElementById("selQty").value) || 0;
    const total = Math.round(selectedFood.cal * qty);
    document.getElementById("totalPreviewCal").innerText = total;
}

function confirmAddFood() {
    if (!selectedFood) return;

    const qty = parseFloat(document.getElementById("selQty").value) || 1;
    const totalCal = Math.round(selectedFood.cal * qty);
    const totalPro = Math.round(selectedFood.pro * qty);

    const newItem = {
        id: Date.now(),
        name: `${selectedFood.name} (${qty} ${selectedFood.unit})`,
        cal: totalCal,
        pro: totalPro,
        selected: true
    };

    if (currentModalType === 'snack') {
        snacks.push(newItem);
        renderSnacks();
    } else {
        mealData[currentModalType].push(newItem);
        renderAllMeals();
    }

    updateSummary();
    closeModal();
}

// Click outside to close (Updated ID)
window.onclick = function (event) {
    const modal = document.getElementById("addFoodModal");
    if (event.target == modal) {
        closeModal();
    }
}