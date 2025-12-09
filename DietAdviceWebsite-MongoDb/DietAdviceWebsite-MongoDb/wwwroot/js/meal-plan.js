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

const mealTimes = {
    breakfast: 8,  // Bữa sáng bắt đầu từ 6h
    lunch: 13,     // Bữa trưa bắt đầu từ 11h
    dinner: 20   // Bữa tối bắt đầu từ 18h (Theo ảnh của bạn)
};

document.addEventListener("DOMContentLoaded", async () => {
    const dateDisplay = document.getElementById("currentDateDisplay");
    if (dateDisplay && dateDisplay.innerText === "Đang tải...") {
        dateDisplay.innerText = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
    }

    if (typeof initialMealPlan !== 'undefined') {
        syncDataFromModel(initialMealPlan);
    }

    try {
        const response = await fetch('/customer/meal-plan/get-all-meals'); 
        if (response.ok) {
            foodDatabase = await response.json();
        } else {
            console.warn("API Error, using fallback data or empty list.");
        }
    } catch (error) {
        console.error("Could not fetch food database:", error);
    }
    
    setupModalSearch();
    document.getElementById("selQty").addEventListener("input", updatePreview);
    document.getElementById("selUnit").addEventListener("change", updatePreview);

    updateSummary();
    updateMealSectionStates();
    
    // Tự động cập nhật mỗi phút
    setInterval(() => {
        updateSummary();
        updateMealSectionStates();
    }, 60000);
});

function syncDataFromModel(mealPlanData) {
    if (!mealPlanData || !mealPlanData.mealsEaten) {
        return;
    }
    
    mealData = {
        breakfast: [],
        lunch: [],
        dinner: []
    };
    snacks = [];

    mealPlanData.mealsEaten.forEach((mealEaten) => {
        const newItem = {
            id: mealEaten.mealId,
            originalId: mealEaten.mealId,
            name: `${mealEaten.name} (${mealEaten.quantity == 1 ? "" : mealEaten.quantity}${mealEaten.unit})`,
            calories: mealEaten.caloriesConsumed,
            protein: mealEaten.protein || 0 
        };

        const timeSlotLower = (mealEaten.timeSlot || '').toLowerCase();
        
        if (timeSlotLower.includes('sáng')) {
            mealData.breakfast.push(newItem);
        } else if (timeSlotLower.includes('trưa')) {
            mealData.lunch.push(newItem);
        } else if (timeSlotLower.includes('tối')) {
            mealData.dinner.push(newItem);
        } else {
            snacks.push(newItem);
        }
    });
}

// --- 4. RENDER UI (Chỉ chạy khi có thay đổi Thêm/Xóa) ---

function renderAllMeals() {
    const now = new Date();
    // Render 3 bữa chính
    ['breakfast', 'lunch', 'dinner'].forEach(type => {
        const grid = document.getElementById(`grid-${type}`);
        if (!grid) return;

        grid.innerHTML = "";
        const items = mealData[type];

        if (!items || items.length === 0) {
            grid.innerHTML = `<p class="empty-text">Chưa có món ăn nào.</p>`;
        } else {
            items.forEach(item => {
                const card = document.createElement("div");
                const proteinInfo = item.protein ? ` &bull; ${item.protein}g Pro` : '';                
                
                card.className = `meal-card selected`;

                card.innerHTML = `
                    <span class="meal-name">${item.name}</span>
                    <span class="meal-info">${item.calories} kcal${proteinInfo}</span>
                `;
                grid.appendChild(card);
            });
        }
    });

    // Render bữa phụ (Snack thì lúc nào cũng ăn được nên luôn selected)
    renderSnacks();
    
    // Cập nhật tổng kết
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
     const now = new Date();
     const currentHour = now.getHours();

     snacks.forEach(s => totalConsumed += (s.calories || 0));

     if (currentHour >= mealTimes.breakfast) { 
         (mealData.breakfast || []).forEach(item => totalConsumed += (item.calories || 0));
     }
    
     if (currentHour >= mealTimes.lunch) {
         (mealData.lunch || []).forEach(item => totalConsumed += (item.calories || 0));
     }
    
     if (currentHour >= mealTimes.dinner) {
         (mealData.dinner || []).forEach(item => totalConsumed += (item.calories || 0));
     }
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

function updateMealSectionStates() {
    const now = new Date();
    const currentHour = now.getHours();

    const breakfastSection = document.getElementById('section-breakfast');
    const lunchSection = document.getElementById('section-lunch');
    const dinnerSection = document.getElementById('section-dinner');

    if (breakfastSection) {
        if (currentHour <= mealTimes.breakfast) {
            breakfastSection.classList.remove('locked');
        } else {
            breakfastSection.classList.add('locked');
        }
    }

    if (lunchSection) {
        if (currentHour <= mealTimes.lunch) {
            lunchSection.classList.remove('locked');
        } else {
            lunchSection.classList.add('locked');
        }
    }

    // Khóa bữa tối nếu chưa đến 14h (2h chiều)
    if (dinnerSection) {
        if (currentHour < mealTimes.dinner) {
            dinnerSection.classList.remove('locked');
        } else {
            dinnerSection.classList.add('locked');
        }
    }
}

// --- 5. FUNCTIONS: REMOVE & ADD (Phải ở Global Scope) ---
function removeItem(type, id) {
    Swal.fire({
        title: 'Bạn chắc chắn chứ?',
        text: "Món ăn này sẽ bị xóa khỏi thực đơn!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Vâng, xóa đi!',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            // Xử lý xóa9i
            if (type === 'snack') {
                snacks = snacks.filter(item => item.id.toString() !== id.toString());
            } else if (clientMealData[type]) {
                clientMealData[type] = clientMealData[type].filter(item => item.id.toString() !== id.toString());
            }

            // TODO: Gọi API xóa Backend ở đây nếu cần

            renderAllMeals();

            // Hiện thông báo thành công (Toast)
            Toast.fire({
                icon: 'success',
                title: 'Đã xóa món ăn thành công'
            });
        }
    });
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
        document.getElementById("selQty").value = 1; // Reset to 1 as a default
        document.getElementById("selUnit").innerHTML = ""; // Clear previous units

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

// [File: meal-plan.js]

async function confirmAddFood() { // Thêm async để dùng await
    if (!selectedFood) return;

    // Lấy dữ liệu từ giao diện
    const quantity = parseFloat(document.getElementById("selQty").value) || 1;
    const unit = document.getElementById("selUnit").value;

    const formData = new FormData();
    formData.append('mealId', selectedFood.id || selectedFood.originalId); // ID món ăn
    formData.append('timeSlot', currentModalType);
    formData.append('quantity', quantity);
    formData.append('unit', unit);
    
    try {
        const response = await fetch('/customer/meal-plan/add-meal', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            alert("Lỗi server: " + result.message);
            return;
        }

        syncDataFromModel(result.data);

        renderAllMeals();
        closeModal();

        return Toast.fire({
            icon: 'success',
            title: 'Đã thêm bửa ăn thành công'
        });
    } catch (error) {
        alert("Có lỗi xảy ra khi kết nối server.");
    }
}


function removeFromTempList(index) {
    if (index > -1 && index < tempMealList.length) {
        tempMealList.splice(index, 1);
        renderModalList(); // Re-render the list
    }
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
    
    // --- LOGIC MỚI ĐỂ ĐIỀN ĐƠN VỊ ---
    const unitSelect = document.getElementById("selUnit");
    unitSelect.innerHTML = ""; // Xóa các lựa chọn cũ

    if (food.units && food.units.length > 0) {
        // Nếu món ăn có danh sách 'units'
        food.units.forEach(unit => {
            const option = document.createElement("option");
            option.value = unit; // e.g., "Tô nhỏ"
            option.textContent = unit; // e.g., "Tô nhỏ"
            unitSelect.appendChild(option);
        });
    } else {
        // Nếu không có, mặc định là "gram"
        const option = document.createElement("option");
        option.value = "gram";
        option.textContent = "Gram";
        unitSelect.appendChild(option);
    }
    // --- KẾT THÚC LOGIC MỚI ---
    
    updatePreview();
}

function updatePreview() {
    if (!selectedFood) return;

    const quantity = parseFloat(document.getElementById("selQty").value) || 0;
    const calBase = selectedFood.nutrition ? selectedFood.nutrition.calories : 0;
    let total = 0;

    // Check if the food has predefined units, assume calories are per serving.
    if (selectedFood.units && selectedFood.units.length > 0) {
        total = Math.round(calBase * quantity);
    } else {
        // Fallback to per-100g calculation if no units are defined.
        total = Math.round((calBase / 100) * quantity);
    }
    
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