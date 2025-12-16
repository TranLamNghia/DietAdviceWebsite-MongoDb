// Biến lưu trữ kết quả

let currentResult = {};
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

const currentUserId = window.appData?.userId || null;

function calculateDiet() {
    // 1. Lấy input
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseInt(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;

    if (!age || !height || !weight) {
        alert("Vui lòng nhập đầy đủ tuổi, chiều cao và cân nặng!");
        return;
    }

    // 2. Tính toán BMI, BMR, TDEE
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;
    bmr = Math.round(bmr);

    const tdee = Math.round(bmr * activity);

    // Target Calories
    let targetCalories = tdee;
    let desc = "Duy trì (Giữ cân)";

    if (goal === 'lose') {
        targetCalories -= 500;
        desc = "Giảm cân (-500 kcal)";
    } else if (goal === 'gain') {
        targetCalories += 500;
        desc = "Tăng cân (+500 kcal)";
    }

    // 3. Tính Macros (Tỷ lệ 30% P - 40% C - 30% F)
    // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
    const pGrams = Math.round((targetCalories * 0.3) / 4);
    const cGrams = Math.round((targetCalories * 0.4) / 4);
    const fGrams = Math.round((targetCalories * 0.3) / 9);

    // 4. Hiển thị kết quả
    displayResults({ bmi, bmr, tdee, targetCalories, desc, pGrams, cGrams, fGrams });
}

function displayResults(data) {
    currentResult = data;

    // Show section right
    document.getElementById('resultSection').style.display = 'block';

    // Scroll if mobile
    if (window.innerWidth < 768) {
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    }

    // Fill 4 boxes
    document.getElementById('resBMI').innerText = data.bmi;
    document.getElementById('resBMR').innerText = data.bmr;
    document.getElementById('resTDEE').innerText = data.tdee;
    document.getElementById('targetCalories').innerText = data.targetCalories;
    document.getElementById('targetDesc').innerText = data.desc;

    // Fill BMI Status
    const bmiStat = document.getElementById('resBMIStatus');
    if (data.bmi < 18.5) bmiStat.innerText = "Thiếu cân";
    else if (data.bmi < 24.9) bmiStat.innerText = "Bình thường";
    else bmiStat.innerText = "Thừa cân";

    // Fill Macros
    document.getElementById('macroProtein').innerText = data.pGrams + "g";
    document.getElementById('macroCarbs').innerText = data.cGrams + "g";
    document.getElementById('macroFats').innerText = data.fGrams + "g";

    // Generate Menu
    renderMenuFromDB(data.targetCalories);

}

function pickOneUnit(units) {
    if (!units || units.length === 0) return "Không rõ";
    return units[Math.floor(Math.random() * units.length)];
}

function renderMenuFromDB(targetCalories) {
    const container = document.getElementById("menuPreviewList");
    container.innerHTML = "";


    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;

    // Lấy các mealType thực sự tồn tại trong DB
    const availableMealTypes = [...new Set(
        window.mealDB.flatMap(m => m.mealTypes || [])
    )];

    if (!availableMealTypes.length) {
        container.innerHTML = "<p>Không có dữ liệu món ăn</p>";
        return;
    }

    const ratio = 1 / availableMealTypes.length;

    availableMealTypes.forEach(mealType => {
        const maxCal = targetCalories * ratio;

        const meals = window.mealDB.filter(m =>
            m.mealTypes.includes(mealType) &&
            m.nutrition?.calories <= maxCal
        );

        if (!meals.length) return;

        const selected = meals.reduce((prev, curr) =>
            Math.abs(curr.nutrition.calories - maxCal) < Math.abs(prev.nutrition.calories - maxCal) ? curr : prev
        );
        const n = selected.nutrition;
        const units = pickOneUnit(selected.units);

        totalCal += n.calories;
        totalP += n.protein;
        totalC += n.carbs;
        totalF += n.fats;

        container.innerHTML += `
            <div class="menu-group">
                <div class="menu-group-header">${mealType}</div>
                <div class="menu-item-row">
                    <div class="menu-item-name">
                        ${selected.name}
                        <span class="meal-unit">(${units})</span>
                    </div>
                    <div class="menu-item-macros">
                        ${n.calories} kcal |
                        P ${n.protein}g |
                        C ${n.carbs}g |
                        F ${n.fats}g
                    </div>
                </div>
            `;
    });

    // Update Footer Summary
    document.getElementById('totalMenuCal').innerText = totalCal + " kcal";
    document.getElementById('totalMenuPro').innerText = totalP + "g";
    document.getElementById('totalMenuCarb').innerText = totalC + "g";
    document.getElementById('totalMenuFat').innerText = totalF + "g";
}

//function saveToDailyMenu() {
//    const btn = document.querySelector('.btn-save-menu');
//    const oldText = btn.innerText;
//    btn.innerText = "Đang lưu...";
//    btn.disabled = true;

//    Toast.fire({
//        icon: 'success',
//        title: 'Đã lưu thực đơn thành công!'
//    });
//}

async function saveToDailyMenu() {
    const data = {
        userId: window.appData?.userId,
        fullName: window.appData?.fullName,
        age: parseInt(document.getElementById("age").value),
        height: parseInt(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value),
        gender: document.getElementById("gender").value,
        activityLevel: parseFloat(document.getElementById("activity").value),
        goalType: document.getElementById("goal").value,
        targetWeight: 65,
        dailyCalorieTarget: parseInt(document.getElementById("targetCalories").innerText)
    };
    try {
        const response = await fetch("/customer/diet-calculator/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server error:", errorText);

            return Toast.fire({
                icon: 'error',
                title: errorText || 'Dữ liệu không hợp lệ'
            });
        }

        const result = await response.json();

        return Toast.fire({
            icon: 'success',
            title: result.message || 'Lưu thành công'
        });

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        return Toast.fire({
            icon: 'error',
            title: 'Không thể kết nối tới server'
        });
    }
}

