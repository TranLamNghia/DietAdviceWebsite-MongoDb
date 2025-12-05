// --- 1. CONFIG & DATA ---
const DAILY_TARGET = 2000;
let foodDatabase = []; // Danh sách món ăn mẫu để tìm kiếm
let currentModalType = '';
let selectedFood = null; // Món ăn đang chọn trong Modal
let tempMealList = []; // Danh sách món ăn tạm thời trong modal "Thay đổi"
let currentEditingType = ''; // Bữa ăn đang được chỉnh sửa (breakfast, lunch, dinner)

// Dữ liệu quản lý phía Client (sẽ được đồng bộ với Server khi load trang)
let mealData = {
    breakfast: [],
    lunch: [],
    dinner: []
};
let snacks = [];

// --- 2. INIT (Chạy khi trang tải xong) ---
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Hiển thị ngày tháng (nếu HTML chưa có server side rendering phần này thì JS sẽ điền)
    const dateDisplay = document.getElementById("currentDateDisplay");
    if (dateDisplay && dateDisplay.innerText === "Đang tải...") {
        dateDisplay.innerText = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
    }

    // 2. QUAN TRỌNG: Đồng bộ dữ liệu từ biến 'initialMealPlan' (Server) vào biến 'mealData' (Client)
    // Để khi người dùng nhấn Xóa/Thêm, JS biết danh sách hiện tại đang có gì.
    processInitialMealPlan();

    // 3. Tải database món ăn mẫu (để dùng cho Modal tìm kiếm)
    try {
        // Giả sử đường dẫn API của bạn là /GetAllMeals
        const response = await fetch('/GetAllMeals'); 
        if (response.ok) {
            foodDatabase = await response.json();
        } else {
            console.warn("API Error, using fallback data or empty list.");
        }
    } catch (error) {
        console.error("Could not fetch food database:", error);
    }

    // 4. Cài đặt sự kiện tìm kiếm và input số lượng
    setupModalSearch();
    document.getElementById("selQty").addEventListener("input", updatePreview);

    // 5. Cập nhật lại thanh tổng kết Calo (để đảm bảo con số chính xác theo JS tính toán)
    updateSummary();
    
    // LƯU Ý: Không gọi renderAllMeals() ở đây để giữ nguyên HTML server đã vẽ.
});

// --- 3. LOGIC XỬ LÝ DỮ LIỆU ---

function processInitialMealPlan() {
    // Biến initialMealPlan được định nghĩa ở thẻ <script> trong file .cshtml
    if (typeof initialMealPlan === 'undefined' || !initialMealPlan || !initialMealPlan.mealsEaten) {
        return;
    }

    initialMealPlan.mealsEaten.forEach((mealEaten, index) => {
        // Tạo object chuẩn cho JS quản lý
        const newItem = {
            id: mealEaten.mealId, // Dùng MealId từ DB làm ID xóa
            originalId: mealEaten.mealId,
            name: `${mealEaten.name} (${mealEaten.quantity}${mealEaten.unit})`,
            calories: mealEaten.caloriesConsumed,
            // Nếu model server có protein thì gán vào, không thì để trống
            protein: mealEaten.protein || 0 
        };

        // Phân loại vào đúng mảng dựa trên TimeSlot
        const timeSlotLower = (mealEaten.timeSlot || '').toLowerCase();
        
        if (timeSlotLower.includes('sáng')) {
            mealData.breakfast.push(newItem);
        } else if (timeSlotLower.includes('trưa')) {
            mealData.lunch.push(newItem);
        } else if (timeSlotLower.includes('tối')) {
            mealData.dinner.push(newItem);
        } else {
            // Các trường hợp còn lại cho vào Snack
            snacks.push(newItem);
        }
    });
}

// --- 4. RENDER UI (Chỉ chạy khi có thay đổi Thêm/Xóa) ---

function renderAllMeals() {
    // Render 3 bữa chính
    ['breakfast', 'lunch', 'dinner'].forEach(type => {
        const grid = document.getElementById(`grid-${type}`);
        if (!grid) return; // Phòng trường hợp ID không khớp

        grid.innerHTML = "";
        const items = mealData[type];

        if (!items || items.length === 0) {
            grid.innerHTML = `<p class="empty-text">Chưa có món ăn nào.</p>`;
        } else {
            items.forEach(item => {
                const card = document.createElement("div");
                card.className = 'meal-card selected';
                const proteinInfo = item.protein ? ` &bull; ${item.protein}g Pro` : '';
                
                // HTML card món ăn
                card.innerHTML = `
                    <span class="meal-name">${item.name}</span>
                    <span class="meal-info">${item.calories} kcal${proteinInfo}</span>
                    <span class="remove-item" onclick="removeItem('${type}', '${item.id}')">&times;</span>
                `;
                grid.appendChild(card);
            });
        }
    });

    // Render bữa phụ
    renderSnacks();
    
    // Cập nhật lại thanh tổng kết
    updateSummary();
}

function renderSnacks() {
    const list = document.getElementById("snackList");
    if (!list) return;

    list.innerHTML = "";

    if (snacks.length === 0) {
        list.innerHTML = `<p class="empty-text" style="color:#aaa; font-style:italic;">Chưa có bữa phụ nào.</p>`;
        return;
    }

    snacks.forEach((snack) => {
        const chip = document.createElement("div");
        chip.className = "snack-chip";
        chip.innerHTML = `
            ${snack.name} (${snack.calories} kcal)
            <span class="remove-snack" onclick="removeItem('snack', '${snack.id}')">&times;</span>
        `;
        list.appendChild(chip);
    });
}

function updateSummary() {
    let totalConsumed = 0;
    
    // Cộng tổng calo từ 3 bữa chính
    Object.values(mealData).flat().forEach(item => totalConsumed += (item.calories || 0));
    // Cộng thêm từ snacks
    snacks.forEach(s => totalConsumed += (s.calories || 0));

    const remaining = DAILY_TARGET - totalConsumed;

    // Cập nhật DOM
    const goalEl = document.getElementById("goalCalories");
    const consEl = document.getElementById("consumedCalories");
    const remEl = document.getElementById("remainingCalories");
    const statusEl = document.getElementById("dayStatus");

    if(goalEl) goalEl.innerText = DAILY_TARGET;
    if(consEl) consEl.innerText = totalConsumed;
    if(remEl) {
        remEl.innerText = remaining;
        
        if (remaining < 0) {
            remEl.parentElement.classList.add("warning");
            statusEl.className = "status-badge over";
            statusEl.innerText = "Thừa calo!";
        } else {
            remEl.parentElement.classList.remove("warning");
            statusEl.className = "status-badge good";
            statusEl.innerText = "Ổn định";
        }
    }

    // Cảnh báo riêng cho bữa tối (nếu cần)
    const dinnerRemEl = document.getElementById("dinner-remaining");
    const dinnerAlert = document.getElementById("dinner-alert");
    if (dinnerRemEl && dinnerAlert) {
        dinnerRemEl.innerText = remaining > 0 ? remaining : 0;
        // Logic hiển thị cảnh báo tùy chỉnh của bạn
        // Ví dụ: dinnerAlert.style.display = remaining < 300 ? 'block' : 'none';
    }
}

// --- 5. FUNCTIONS: REMOVE & ADD (Phải ở Global Scope) ---

function removeItem(type, id) {
    if (!confirm("Xóa món ăn này khỏi thực đơn?")) {
        return;
    }
    
    // TODO: Gọi API xóa phía Backend tại đây
    // fetch(`/api/remove-meal?id=${id}`, { method: 'DELETE' })...

    // Cập nhật Client state
    if (type === 'snack') {
        snacks = snacks.filter(item => item.id.toString() !== id.toString());
    } else if (mealData[type]) {
        mealData[type] = mealData[type].filter(item => item.id.toString() !== id.toString());
    }

    // Render lại giao diện sau khi xóa
    renderAllMeals();
}

function confirmAddFood() {
    if (!selectedFood) return;
    
    // Lấy dữ liệu từ form modal
    const qtyInGrams = parseFloat(document.getElementById("selQty").value) || 100;
    const factor = qtyInGrams / 100;
    
    // Tính toán dinh dưỡng
    // Lưu ý: data mẫu phải có nutrition.calories, nếu API trả về khác thì phải sửa chỗ này
    const calBase = selectedFood.nutrition ? selectedFood.nutrition.calories : 0;
    const proBase = selectedFood.nutrition ? selectedFood.nutrition.protein : 0;

    const totalCalories = Math.round(calBase * factor);
    const totalProtein = Math.round(proBase * factor);

    const newItem = {
        id: Date.now().toString(), // ID tạm thời
        originalId: selectedFood.id,
        name: selectedFood.name, // Tên món
        quantity: qtyInGrams,
        unit: 'g', // Giả sử đơn vị là gam
        calories: totalCalories,
        protein: totalProtein,
    };

    // TODO: Gọi API thêm món vào DB tại đây

    // Cập nhật Client state
    if (currentModalType === 'snack') {
        snacks.push(newItem);
    } else if (mealData[currentModalType]) {
        mealData[currentModalType].push(newItem);
    }

    // Render lại giao diện và đóng modal
    renderAllMeals();
    closeModal();
}

// --- 6. MODAL UTILITIES (Phải ở Global Scope) ---

function openAddModal(type) {
    currentModalType = type;
    const modal = document.getElementById("addFoodModal");
    if (modal) {
        modal.classList.add("show");
        
        // Reset form modal
        document.getElementById("modalSearchInput").value = "";
        document.getElementById("modalSuggestions").innerHTML = "";
        document.getElementById("modalSuggestions").style.display = "none";
        document.getElementById("selectedItemDetails").style.display = "none";
        document.getElementById("selQty").value = 100;

        setTimeout(() => document.getElementById("modalSearchInput").focus(), 100);
    } else {
        console.error("Không tìm thấy Modal với ID 'addFoodModal'");
    }
}

function openChangeModal(type) {
    currentEditingType = type;
    document.getElementById("changeMealModal").classList.add("show");
    document.getElementById("targetCalInput").value = ""; // Reset filter

    // Clone danh sách món hiện tại vào biến tạm để chỉnh sửa
    // Phải clone để nếu user bấm Hủy thì không ảnh hưởng data chính
    if (type === 'snack') {
        tempMealList = JSON.parse(JSON.stringify(snacks));
        document.getElementById("modalTitle").innerText = "Quản lý bữa phụ";
    } else {
        tempMealList = JSON.parse(JSON.stringify(mealData[type]));
        const title = type === 'breakfast' ? 'Bữa Sáng' : type === 'lunch' ? 'Bữa Trưa' : 'Bữa Tối';
        document.getElementById("modalTitle").innerText = `Thay đổi ${title}`;
    }

    renderModalList();
    filterMealOptions(); // Init dropdown
}

function renderModalList() {
    const listContainer = document.getElementById("modalCurrentList");
    if (!listContainer) {
        console.error("Error: Element with ID 'modalCurrentList' not found for rendering modal list.");
        return;
    }

    listContainer.innerHTML = "";
    if (!tempMealList || tempMealList.length === 0) {
        listContainer.innerHTML = "<p>Không có món ăn nào trong danh sách tạm thời.</p>";
        return;
    }

    tempMealList.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = "h-item";
        itemEl.innerHTML = `
            <span>${item.name} (${item.calories} kcal)</span>
            <button class="h-remove" onclick="removeFromTempList(${index})">&times;</button>
        `;
        listContainer.appendChild(itemEl);
    });
}

function removeFromTempList(index) {
    if (index > -1 && index < tempMealList.length) {
        tempMealList.splice(index, 1);
        renderModalList(); // Re-render the list
    }
}


function filterMealOptions() {
    // This is a placeholder.
    // In a real scenario, this would filter a list of available foods
    // based on user input (e.g., calories, category).
    console.log("filterMealOptions() called - functionality to be implemented.");
}

function closeModal() {
    const addModal = document.getElementById("addFoodModal");
    if (addModal) addModal.classList.remove("show");

    const changeModal = document.getElementById("changeMealModal");
    if (changeModal) changeModal.classList.remove("show");
}

function setupModalSearch() {
    const input = document.getElementById("modalSearchInput");
    const suggestions = document.getElementById("modalSuggestions");

    if (!input || !suggestions) return;

    input.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase().trim();
        suggestions.innerHTML = "";

        if (val.length < 1) {
            suggestions.style.display = "none";
            return;
        }

        // Lọc món ăn từ foodDatabase
        const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(val));

        if (matches.length > 0) {
            suggestions.style.display = "block";
            matches.forEach(food => {
                const div = document.createElement("div");
                div.className = "suggestion-item";
                const cal = food.nutrition ? food.nutrition.calories : 0;
                div.innerHTML = `<b>${food.name}</b> <span style='color:#999; font-size:0.8rem'>${cal} kcal / 100g</span>`;
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
    
    // Ẩn gợi ý, hiện chi tiết
    document.getElementById("modalSuggestions").style.display = "none";
    document.getElementById("modalSearchInput").value = food.name;
    document.getElementById("selectedItemDetails").style.display = "block";
    
    // Điền thông tin vào form
    document.getElementById("selName").innerText = food.name;
    const cal = food.nutrition ? food.nutrition.calories : 0;
    const pro = food.nutrition ? food.nutrition.protein : 0;
    
    document.getElementById("selCal").innerText = cal;
    document.getElementById("selPro").innerText = pro;
    
    updatePreview();
}

function updatePreview() {
    if (!selectedFood) return;
    const qtyInGrams = parseFloat(document.getElementById("selQty").value) || 0;
    const calBase = selectedFood.nutrition ? selectedFood.nutrition.calories : 0;
    
    const total = Math.round((calBase / 100) * qtyInGrams);
    document.getElementById("totalPreviewCal").innerText = total;
}

// Đóng modal khi click ra ngoài
window.onclick = function (event) {
    const addModal = document.getElementById("addFoodModal");
    const changeModal = document.getElementById("changeMealModal");
    if (event.target == addModal || event.target == changeModal) {
        closeModal();
    }
}