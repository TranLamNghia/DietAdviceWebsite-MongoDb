<<<<<<< Updated upstream
﻿// Biến lưu trữ kết quả
=======
﻿

// Biến lưu trữ kết quả
>>>>>>> Stashed changes
let currentResult = {};

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

        const selected = meals[Math.floor(Math.random() * meals.length)];
        const n = selected.nutrition;

        totalCal += n.calories;
        totalP += n.protein;
        totalC += n.carbs;
        totalF += n.fats;

        container.innerHTML += `
            <div class="menu-group">
                <div class="menu-group-header">${mealType}</div>
                <div class="menu-item-row">
                    <div class="menu-item-name">${selected.name}</div>
                    <div class="menu-item-macros">
                        ${n.calories} kcal |
                        P ${n.protein}g |
                        C ${n.carbs}g |
                        F ${n.fats}g
                    </div>
                </div>
<<<<<<< Updated upstream
            `;
        });
        html += `</div>`;
        return html;
    };

    container.innerHTML += renderMealGroup("Sáng", sampleMenuDB.breakfast);
    container.innerHTML += renderMealGroup("Trưa", sampleMenuDB.lunch);
    container.innerHTML += renderMealGroup("Tối", sampleMenuDB.dinner);

    // Update Footer Summary
    document.getElementById('totalMenuCal').innerText = totalCal + " kcal";
    document.getElementById('totalMenuPro').innerText = totalP + "g";
    document.getElementById('totalMenuCarb').innerText = totalC + "g";
    document.getElementById('totalMenuFat').innerText = totalF + "g";
}

function saveToDailyMenu() {
    const btn = document.querySelector('.btn-save-menu');
    const oldText = btn.innerText;
    btn.innerText = "Đang lưu...";
    btn.disabled = true;

    setTimeout(() => {
        alert("Đã lưu thực đơn thành công!");
        btn.innerText = oldText;
        btn.disabled = false;
    }, 1000);
=======
            </div>
        `;
    });

    document.getElementById("totalMenuCal").innerText = Math.round(totalCal) + " kcal";
    document.getElementById("totalMenuPro").innerText = Math.round(totalP) + "g";
    document.getElementById("totalMenuCarb").innerText = Math.round(totalC) + "g";
    document.getElementById("totalMenuFat").innerText = Math.round(totalF) + "g";
>>>>>>> Stashed changes
}
function saveToDailyMenu() {

<<<<<<< Updated upstream
=======

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
>>>>>>> Stashed changes
    const data = {
        userId: "user123",
        fullName: "Nguyen Van A",
        age: parseInt(document.getElementById("age").value),
        height: parseInt(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value),
        gender: document.getElementById("gender").value,
        activityLevel: parseFloat(document.getElementById("activity").value),
        goalType: document.getElementById("goal").value,
        targetWeight: 65,
        dailyCalorieTarget: parseInt(document.getElementById("targetCalories").innerText)
    };

<<<<<<< Updated upstream
    fetch("/customer/diet-calculator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => alert(res.message))
        .catch(err => console.error(err));
=======
    try {
        const response = await fetch("/customer/diet-calculator/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        // 🔴 QUAN TRỌNG
        if (!response.ok) {
            const errorText = await response.text(); // 👈 KHÔNG json()
            console.error("Server error:", errorText);

            return Toast.fire({
                icon: 'error',
                title: errorText || 'Dữ liệu không hợp lệ'
            });
        }

        const result = await response.json(); // ✅ CHỈ parse khi OK

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
>>>>>>> Stashed changes
}

