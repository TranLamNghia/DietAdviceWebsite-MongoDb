// --- PHẦN DỮ LIỆU GIẢ LẬP (DATABASE MÓN ĂN) ---
// Thực tế bạn sẽ gọi API để lấy list này từ MongoDB
const foodDatabase = [
    { id: 'f1', name: "Phở bò tái", unit: "Tô", cal: 450, pro: 22 },
    { id: 'f2', name: "Cơm trắng", unit: "Chén", cal: 200, pro: 4 },
    { id: 'f3', name: "Trứng ốp la", unit: "Quả", cal: 90, pro: 7 },
    { id: 'f4', name: "Ức gà luộc", unit: "100g", cal: 165, pro: 31 },
    { id: 'f5', name: "Chuối", unit: "Quả", cal: 105, pro: 1 },
    { id: 'f6', name: "Bánh mì kẹp thịt", unit: "Cái", cal: 400, pro: 15 },
    { id: 'f7', name: "Rau muống xào tỏi", unit: "Đĩa", cal: 120, pro: 3 },
    { id: 'f8', name: "Sữa chua có đường", unit: "Hộp", cal: 100, pro: 5 }
];

let selectedFoodItem = null; // Lưu món đang chọn tạm thời trong modal

// --- LOGIC SEARCH & AUTOCOMPLETE ---

// 1. Lắng nghe sự kiện nhập liệu vào ô tìm kiếm
document.getElementById("foodSearchInput").addEventListener("input", function (e) {
    const keyword = e.target.value.toLowerCase();
    const suggestionsBox = document.getElementById("foodSuggestions");

    if (keyword.length < 1) {
        suggestionsBox.style.display = "none";
        return;
    }

    // Lọc món ăn từ DB
    const matches = foodDatabase.filter(food => food.name.toLowerCase().includes(keyword));

    // Render danh sách gợi ý
    suggestionsBox.innerHTML = "";
    if (matches.length > 0) {
        suggestionsBox.style.display = "block";
        matches.forEach(food => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerHTML = `<span>${food.name}</span> <small>${food.cal} kcal / ${food.unit}</small>`;

            // Khi chọn món
            div.onclick = () => selectFoodSuggestion(food);
            suggestionsBox.appendChild(div);
        });
    } else {
        suggestionsBox.style.display = "none";
    }
});

// 2. Xử lý khi người dùng chọn 1 món từ gợi ý
function selectFoodSuggestion(food) {
    selectedFoodItem = food;

    // Điền thông tin vào form
    document.getElementById("foodSearchInput").value = food.name;
    document.getElementById("foodUnit").innerHTML = `<option value="${food.unit}">${food.unit}</option>`;

    // Ẩn gợi ý
    document.getElementById("foodSuggestions").style.display = "none";

    // Tính toán lại preview
    calculatePreview();
}

// 3. Tính toán Preview (Calo = Base * Số lượng)
document.getElementById("foodQuantity").addEventListener("input", calculatePreview);

function calculatePreview() {
    if (!selectedFoodItem) return;

    const qty = parseFloat(document.getElementById("foodQuantity").value) || 0;
    const totalCal = Math.round(selectedFoodItem.cal * qty);
    const totalPro = Math.round(selectedFoodItem.pro * qty);

    document.getElementById("previewCal").innerText = totalCal;
    document.getElementById("previewPro").innerText = totalPro;
}

// --- CÁC HÀM CŨ ĐƯỢC SỬA LẠI ---

// Mở modal
function openCustomModal(mealKey) {
    currentModalMealType = mealKey;
    const modal = document.getElementById("customMealModal");
    modal.style.display = "flex"; // Dùng inline style hoặc class đều được, ở đây tôi force style
    modal.classList.add("show");

    // Reset form
    document.getElementById("foodSearchInput").value = "";
    document.getElementById("foodQuantity").value = 1;
    document.getElementById("previewCal").innerText = "0";
    selectedFoodItem = null;
}

// Đóng modal
function closeModal() {
    const modal = document.getElementById("customMealModal");
    modal.classList.remove("show");
    modal.style.display = "none";
}

// Lưu món ăn
function saveCustomMeal() {
    if (!selectedFoodItem) {
        alert("Vui lòng chọn một món ăn từ danh sách gợi ý!");
        return;
    }

    const qty = parseFloat(document.getElementById("foodQuantity").value) || 1;

    const newItem = {
        id: Date.now(),
        name: `${selectedFoodItem.name} (${qty} ${selectedFoodItem.unit})`, // Ví dụ: Cơm trắng (2 Chén)
        cal: Math.round(selectedFoodItem.cal * qty),
        pro: Math.round(selectedFoodItem.pro * qty),
        selected: true
    };

    // Push vào data của bữa ăn hiện tại
    suggestedMeals[currentModalMealType].push(newItem);

    // Update UI
    renderMealItems(currentModalMealType, suggestedMeals[currentModalMealType], false);
    updateSummary();
    closeModal();
}