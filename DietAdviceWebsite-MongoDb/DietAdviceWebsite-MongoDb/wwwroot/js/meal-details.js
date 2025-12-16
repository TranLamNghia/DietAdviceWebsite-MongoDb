document.addEventListener("DOMContentLoaded", function () {
    const qtyInput = document.getElementById("calQty");
    const unitSelect = document.getElementById("calUnit");

    const displayCal = document.getElementById("totalResult");
    const displayPro = document.getElementById("totalPro");

    // Hàm lấy hệ số nhân (Logic chuẩn bạn đã duyệt)
    function getUnitMultiplier(index) {
        const rates = [0.8, 1, 1.3, 1.5, 1.7, 2];

        if (index < 0 || index >= rates.length) return 1.0;

        return rates[index];
    }

    function calculateRealTime() {
        const quantity = parseFloat(qtyInput.value) || 0;
        const unitIndex = parseInt(unitSelect.value); // Lấy index (0, 1, 2...)

        let multiplier = 1.0;
        let finalCalories = 0;
        let finalProtein = 0;

        if (hasUnits && unitIndex >= 0) {
            // Trường hợp có đơn vị (Tô nhỏ, Tô lớn...)
            multiplier = getUnitMultiplier(unitIndex);

            // Công thức: Base * Hệ Số * Số Lượng
            finalCalories = Math.round(baseNutrition.calories * multiplier * quantity);
            finalProtein = Math.round(baseNutrition.protein * multiplier * quantity);
        } else {
            // Trường hợp Gram (tính theo 100g)
            // Giả sử baseNutrition là cho 100g
            finalCalories = Math.round((baseNutrition.calories / 100) * quantity);
            finalProtein = Math.round((baseNutrition.protein / 100) * quantity);
        }

        // Cập nhật giao diện (Hiệu ứng đếm số nhẹ nếu thích)
        displayCal.innerText = finalCalories;
        displayPro.innerText = finalProtein;
    }

    // Gắn sự kiện lắng nghe thay đổi
    qtyInput.addEventListener("input", calculateRealTime);
    unitSelect.addEventListener("change", calculateRealTime);

    // Chạy lần đầu
    calculateRealTime();
});