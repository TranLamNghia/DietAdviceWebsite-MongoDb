document.addEventListener("DOMContentLoaded", function () {
    // 1. KHỞI TẠO CÁC DOM ELEMENT
    const dom = {
        qtyInput: document.getElementById("selQty"), // Lưu ý: ID bên HTML mới là selQty
        unitSelect: document.getElementById("selUnit"), // ID bên HTML mới là selUnit
        
        // Các phần hiển thị kết quả
        resCalories: document.getElementById("totalResult"),
        resPro: document.getElementById("totalPro"),
        resCarbs: document.getElementById("totalCarbs"),
        resFats: document.getElementById("totalFats")
    };

    // 2. HÀM LẤY HỆ SỐ NHÂN (Dựa trên Index của Unit)
    // Quy ước: Index 0 (nhỏ) -> x1.0, Index 1 -> x1.2...
    function getUnitMultiplier(index) {
        const rates = [1.0, 1.2, 1.5, 1.8, 2.0];
        
        // Nếu index không hợp lệ hoặc chọn Gram -> trả về 1
        if (index < 0 || index >= rates.length) return 1.0;
        return rates[index];
    }

    // 3. RENDER DROPDOWN ĐƠN VỊ
    // Dữ liệu 'mealUnits' và 'hasUnits' được lấy từ biến toàn cục (khai báo bên View)
    function initUnitDropdown() {
        dom.unitSelect.innerHTML = ""; // Xóa option cũ

        if (typeof hasUnits !== 'undefined' && hasUnits && typeof mealUnits !== 'undefined' && mealUnits.length > 0) {
            // Nếu có đơn vị (Tô, Dĩa...), render ra list
            mealUnits.forEach((unit, index) => {
                const option = document.createElement("option");
                option.value = index; // Value là index (0, 1, 2...) để tính hệ số
                option.text = unit;
                dom.unitSelect.appendChild(option);
            });
        } else {
            // Nếu không có, mặc định là Gram
            const option = document.createElement("option");
            option.value = "gram";
            option.text = "Gram";
            dom.unitSelect.appendChild(option);
            
            // Nếu là Gram, mặc định số lượng nên là 100g cho chuẩn
            dom.qtyInput.value = 100;
        }
    }

    // 4. LOGIC TÍNH TOÁN
    function calculateNutrition() {
        // Lấy giá trị từ input
        const quantity = parseFloat(dom.qtyInput.value) || 0;
        const unitValue = dom.unitSelect.value;
        
        // Biến toàn cục 'baseNutrition' đã được khai báo bên file .cshtml
        if (typeof baseNutrition === 'undefined') return;

        let multiplier = 1.0;
        let isGram = (unitValue === "gram");

        if (!isGram) {
            // Nếu chọn theo Unit (Tô, Dĩa...) -> Dùng index để lấy hệ số
            const index = parseInt(unitValue);
            multiplier = getUnitMultiplier(index);
        } else {
            // Nếu là Gram: Tính theo tỷ lệ trên 100g
            // Ví dụ: Nhập 100g -> nhân 1. Nhập 50g -> nhân 0.5
            multiplier = quantity / 100; 
        }

        let finalCal, finalPro, finalCarb, finalFat;

        if (isGram) {
            // Chế độ Gram: (Base * Multiplier)
            finalCal = baseNutrition.calories * multiplier;
            finalPro = baseNutrition.protein * multiplier;
            finalCarb = baseNutrition.carbs * multiplier;
            finalFat = baseNutrition.fats * multiplier;
        } else {
            // Chế độ Unit: (Base * Hệ số Unit * Số lượng suất)
            finalCal = baseNutrition.calories * multiplier * quantity;
            finalPro = baseNutrition.protein * multiplier * quantity;
            finalCarb = baseNutrition.carbs * multiplier * quantity;
            finalFat = baseNutrition.fats * multiplier * quantity;
        }

        // Cập nhật UI (Làm tròn số)
        dom.resCalories.textContent = Math.round(finalCal);
        dom.resPro.textContent = Math.round(finalPro);
        dom.resCarbs.textContent = Math.round(finalCarb);
        dom.resFats.textContent = Math.round(finalFat);
    }

    // 5. GẮN SỰ KIỆN & CHẠY
    dom.qtyInput.addEventListener("input", calculateNutrition);
    dom.unitSelect.addEventListener("change", calculateNutrition);

    initUnitDropdown();
    calculateNutrition(); // Tính ngay khi load trang
});