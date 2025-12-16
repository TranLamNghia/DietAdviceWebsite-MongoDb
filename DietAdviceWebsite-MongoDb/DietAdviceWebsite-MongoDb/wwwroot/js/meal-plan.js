let selectedComboFood = null;
let itemsToDelete = [];
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
            name: `${mealEaten.name} (${mealEaten.quantity == 1 ? "" : mealEaten.quantity + " "}${mealEaten.unit})`,
            calories: mealEaten.caloriesConsumed,
            protein: mealEaten.protein || 0,
            timeSlot: mealEaten.timeSlot
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
            <span class="remove-snack" onclick="removeItem('${snack.timeSlot}', '${snack.id}')">&times;</span>
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

    // Cập nhật DOM
    const goalEl = document.getElementById("goalCalories");
    const consEl = document.getElementById("consumedCalories");
    const remEl = document.getElementById("remainingCalories");
    const statusEl = document.getElementById("dayStatus");

    // Đọc giá trị mục tiêu từ DOM thay vì dùng biến không xác định
    const dailyTarget = parseInt(goalEl.innerText) || 0;
    const remaining = dailyTarget - totalConsumed;

    if (consEl) consEl.innerText = totalConsumed;
    if (remEl) {
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
async function removeItem(type, id) {
    Swal.fire({
        title: 'Bạn chắc chắn chứ?',
        text: "Món ăn này sẽ bị xóa khỏi thực đơn!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Vâng, xóa đi!',
        cancelButtonText: 'Hủy'
    }).then(async (result) => {
        if (result.isConfirmed) {

            //if (type === 'snack' || type === 'Snack') {
            //    type = 'Bữa phụ';
            //}

            try {
                const response = await fetch(`/customer/meal-plan/delete-meal?mealId=${id}&timeSlot=${type}`, {
                    method: 'DELETE'
                })

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
                    title: 'Đã xóa món ăn thành công'
                });
            } catch (error) {
                console.error(error);
                alert("Có lỗi xảy ra khi kết nối server.");
            }
        }
    });
}

function onComboSelectionChange() {
    const selectBox = document.getElementById("mealSelectBox");
    const unitSelect = document.getElementById("comboUnit");
    const selectedId = selectBox.value;

    // Reset
    selectedComboFood = null;
    unitSelect.innerHTML = "";

    if (!selectedId) return;

    // Tìm món ăn trong database
    const food = foodDatabase.find(f => f.id === selectedId);
    if (!food) return;

    selectedComboFood = food; // Lưu lại để dùng cho nút Thêm

    // --- Cập nhật Dropdown Đơn vị ---
    if (food.units && food.units.length > 0) {
        // Nếu món có danh sách đơn vị (Tô, Dĩa...)
        food.units.forEach(unit => {
            const option = document.createElement("option");
            option.value = unit;
            option.text = unit;
            unitSelect.appendChild(option);
        });
    } else {
        // Nếu không có, mặc định là Gram
        const option = document.createElement("option");
        option.value = "gram";
        option.text = "Gram";
        unitSelect.appendChild(option);
    }
}

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

function addFromControlPanel() {
    if (!selectedComboFood) return;

    const qtyInput = document.getElementById("comboQty");
    const unitSelect = document.getElementById("comboUnit");
    const quantity = parseFloat(qtyInput.value) || 0;
    const unit = unitSelect.value;
    const idx = unitSelect.index;

    if (quantity <= 0) {
        alert("Số lượng phải lớn hơn 0");
        return;
    }

    const baseCal = selectedComboFood.nutrition ? selectedComboFood.nutrition.calories : 0;
    let totalCal = 0;

    if (selectedComboFood.units && selectedComboFood.units.length > 0) {
        const unitIndex = selectedComboFood.units.indexOf(unit);        
        const multiplier = getUnitMultiplier(unitIndex);

        totalCal = Math.round(baseCal * multiplier * quantity);
    } else {
        totalCal = Math.round((baseCal / 100) * quantity);
    }

    const newItem = {
        id: selectedComboFood.id,
        originalId: selectedComboFood.id,
        name: `${selectedComboFood.name} (${quantity} ${unit})`,
        calories: totalCal,
        protein: selectedComboFood.nutrition ? selectedComboFood.nutrition.protein : 0,
        
        quantity: quantity,
        unit: unit,
        isNew: true // <--- Đánh dấu là món mới thêm
    };

    tempMealList.push(newItem);
    renderModalList();
    
    // Reset form
    document.getElementById("mealSelectBox").value = "";
    document.getElementById("comboQty").value = 1;
    document.getElementById("comboUnit").innerHTML = "";
    selectedComboFood = null;
}

function openChangeModal(type, title) {
    currentEditingType = title;
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

    itemsToDelete = [];

    renderModalList();
    filterMealOptions(); // Init dropdown
}

function renderModalList() {
    const listContainer = document.getElementById("modalCurrentList");
    const totalEl = document.getElementById("modalTotalCal"); // Thẻ <p> hiển thị tổng

    if (!listContainer) return;

    listContainer.innerHTML = "";
    
    let currentTotalCal = 0; // Biến tính tổng

    if (!tempMealList || tempMealList.length === 0) {
        listContainer.innerHTML = "<p style='color:#777; font-style:italic;'>Chưa có món nào trong bữa này.</p>";
    } else {
        tempMealList.forEach((item, index) => {
            // Cộng dồn calo
            currentTotalCal += (item.calories || 0);

            const itemEl = document.createElement("div");
            itemEl.className = "h-item"; // Class CSS cho item nằm ngang
            // Style inline nhẹ để demo nếu chưa có CSS class
            itemEl.style.display = "inline-flex";
            itemEl.style.alignItems = "center";
            itemEl.style.marginRight = "10px";
            itemEl.style.background = "#f0f0f0";
            itemEl.style.padding = "5px 10px";
            itemEl.style.borderRadius = "15px";

            itemEl.innerHTML = `
                <span>${item.name} - <b>${item.calories} kcal</b></span>
                <span 
                    style="margin-left:8px; cursor:pointer; color:red; font-weight:bold;" 
                    onclick="removeFromTempList(${index})"
                >&times;</span>
            `;
            listContainer.appendChild(itemEl);
        });
    }

    // Hiển thị tổng calo ra màn hình Modal
    if (totalEl) {
        totalEl.innerText = `Tổng: ${currentTotalCal} kcal`;
        // Đổi màu nếu vượt quá mức nào đó (ví dụ logic tùy chọn)
        totalEl.style.color = currentTotalCal > 800 ? "red" : "#333"; 
    }
}

async function saveMealChanges() {
    // 1. Lọc ra các món MỚI cần thêm
    const itemsToAdd = tempMealList.filter(item => item.isNew === true);

    // 2. Danh sách các món cần xóa đã có trong itemsToDelete
    
    // Nếu không có thay đổi gì thì đóng luôn
    if (itemsToAdd.length === 0 && itemsToDelete.length === 0) {
        closeModal();
        return;
    }

    // Hiển thị loading (nếu muốn)
    const btnSave = document.querySelector('.btn-confirm-save');
    const oldText = btnSave.innerText;
    btnSave.innerText = "Đang lưu...";
    btnSave.disabled = true;

    try {
        const promises = [];

        itemsToDelete.forEach(id => {
            const formData = new FormData();
            formData.append('mealId', id);
            formData.append('timeSlot', currentEditingType); 

            // Đẩy promise vào mảng
            promises.push(
                fetch(`/customer/meal-plan/delete-meal?mealId=${id}&timeSlot=${currentEditingType}`, {
                    method: 'DELETE'
                }).then(res => res.json())
            );
        });

        // --- TẠO REQUEST THÊM ---
        itemsToAdd.forEach(item => {
            const formData = new FormData();
            formData.append('MealId', item.id); // ID món ăn
            formData.append('TimeSlot', currentEditingType);
            formData.append('Quantity', item.quantity);
            formData.append('Unit', item.unit);

            // Đẩy promise vào mảng
            promises.push(
                fetch('/customer/meal-plan/add-meal', {
                    method: 'POST',
                    body: formData
                }).then(res => res.json())
            );
        });

        // --- CHẠY TẤT CẢ REQUEST CÙNG LÚC ---
        // Promise.all sẽ đợi tất cả request xong hết mới chạy tiếp
        const results = await Promise.all(promises);

        // Kiểm tra xem có lỗi nào không
        const hasError = results.some(res => !res.success);

        if (hasError) {
            Swal.fire('Cảnh báo', 'Một số thay đổi có thể chưa được lưu. Vui lòng kiểm tra lại.', 'warning');
        } else {
            Toast.fire({ icon: 'success', title: 'Đã cập nhật thực đơn!' });
        }

        const lastSuccessResult = results.reverse().find(r => r.success && r.data);
        
        if (lastSuccessResult) {
            syncDataFromModel(lastSuccessResult.data);
        } else {
            location.reload();
        }

        renderAllMeals();
        closeModal();

    } catch (error) {
        console.error(error);
        Swal.fire('Lỗi', 'Có lỗi xảy ra khi lưu thay đổi.', 'error');
    } finally {
        // Trả lại trạng thái nút
        btnSave.innerText = oldText;
        btnSave.disabled = false;
    }
}

function filterMealOptions() {
    const inputVal = document.getElementById("targetCalInput").value;
    const maxCal = inputVal ? parseFloat(inputVal) : Infinity; // Nếu để trống thì lấy tất cả (Infinity)
    const selectBox = document.getElementById("mealSelectBox");

    // Reset ComboBox, chỉ giữ lại option mặc định
    selectBox.innerHTML = '<option value="">-- Chọn món ăn --</option>';

    // Duyệt qua foodDatabase (đã fetch từ API khi load trang)
    foodDatabase.forEach(food => {
        const calories = food.nutrition ? food.nutrition.calories : 0;

        // Kiểm tra điều kiện Calo
        if (calories <= maxCal) {
            const option = document.createElement("option");
            option.value = food.id; // Lưu ID vào value để lúc chọn tìm lại được object
            option.text = `${food.name} (${calories} kcal)`; // Text hiển thị: Tên (Calo)
            selectBox.appendChild(option);
        }
    });
}

function addFromSelectBox() {
    const selectBox = document.getElementById("mealSelectBox");
    const selectedId = selectBox.value;

    // Nếu chọn option mặc định thì không làm gì
    if (!selectedId) return;

    // Tìm object món ăn trong foodDatabase dựa vào ID
    const food = foodDatabase.find(f => f.id === selectedId);
    if (!food) return;

    // --- Xử lý Logic mặc định ---
    // Vì đây là chức năng "Add nhanh", ta sẽ mặc định số lượng là 1
    // Lấy đơn vị đầu tiên trong mảng units, nếu không có thì để là 'Phần'
    const defaultUnit = (food.units && food.units.length > 0) ? food.units[0] : 'Phần';
    const calories = food.nutrition ? food.nutrition.calories : 0;
    const protein = food.nutrition ? food.nutrition.protein : 0;

    // Tạo item mới theo đúng cấu trúc của tempMealList
    const newItem = {
        id: food.id, 
        originalId: food.id,
        name: `${food.name} (1 ${defaultUnit})`, // Format tên hiển thị kèm đơn vị
        calories: calories,
        protein: protein
    };

    // Thêm vào danh sách tạm
    tempMealList.push(newItem);

    // Render lại danh sách và tính lại tổng calo
    renderModalList();

    // Reset ComboBox về trạng thái chưa chọn để người dùng có thể chọn tiếp món khác
    selectBox.value = "";
}

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
        const item = tempMealList[index];

        if (!item.isNew) {
            itemsToDelete.push(item.id);
        }

        tempMealList.splice(index, 1);
        renderModalList(); 
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
    const unitSelect = document.getElementById("selUnit");
    const currentUnit = unitSelect.value;
    
    const calBase = selectedFood.nutrition ? selectedFood.nutrition.calories : 0;
    let total = 0;

    if (selectedFood.units && selectedFood.units.length > 0) {
        // Tìm index của unit đang chọn
        const unitIndex = selectedFood.units.indexOf(currentUnit);
        
        // Lấy hệ số
        const multiplier = getUnitMultiplier(unitIndex);
        
        // Tính toán
        total = Math.round(calBase * multiplier * quantity);
    } else {
        // Logic cho Gram (mặc định)
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

function getUnitMultiplier(index) {
    const rates = [0.8, 1, 1.3, 1.5, 1.7, 2];
    
    return (index >= 0 && index < rates.length) ? rates[index] : 1.0;
}