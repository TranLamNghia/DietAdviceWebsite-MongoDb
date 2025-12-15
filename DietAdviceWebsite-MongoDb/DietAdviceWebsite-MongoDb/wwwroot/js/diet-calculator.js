const currentUserId = window.appData.userId;

// Biến lưu trữ kết quả
let currentResult = {};

// Database món ăn mẫu (Giả lập)
const sampleMenuDB = {
    breakfast: [
        { name: "Trứng ốp la", cal: 200, p: 14, c: 1, f: 15 },
        { name: "Bánh mì nướng", cal: 150, p: 4, c: 30, f: 2 },
        { name: "Sữa tươi", cal: 120, p: 8, c: 12, f: 5 }
    ],
    lunch: [
        { name: "Cơm gà", cal: 450, p: 35, c: 50, f: 8 },
        { name: "Salad rau xanh", cal: 150, p: 5, c: 10, f: 10 },
        { name: "Nước ép cam", cal: 100, p: 1, c: 24, f: 0 }
    ],
    dinner: [
        { name: "Cá hồi nướng", cal: 350, p: 40, c: 0, f: 20 },
        { name: "Cơm trắng (1/2)", cal: 130, p: 2, c: 28, f: 0 },
        { name: "Rau xanh luộc", cal: 50, p: 3, c: 8, f: 0 }
    ]
};

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
    renderMenu();
}

function renderMenu() {
    const container = document.getElementById('menuPreviewList');
    container.innerHTML = "";

    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;

    // Helper render function
    const renderMealGroup = (title, items) => {
        let html = `<div class="menu-group"><div class="menu-group-header">${title}</div>`;
        items.forEach(item => {
            totalCal += item.cal;
            totalP += item.p;
            totalC += item.c;
            totalF += item.f;

            html += `
                <div class="menu-item-row">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-macros">
                        ${item.cal} kcal &nbsp;|&nbsp; P: ${item.p}g &nbsp; C: ${item.c}g &nbsp; F: ${item.f}g
                    </div>
                </div>
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

    Toast.fire({
        icon: 'success',
        title: 'Đã lưu thực đơn thành công!'
    });
}

async function saveToDailyMenu() {
    const data = {
        userId: currentUserId,
        age: parseInt(document.getElementById("age").value),
        height: parseInt(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value),
        gender: document.getElementById("gender").value,
        activityLevel: document.getElementById("activity").value,

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

        const result = await response.json(); 

        if (response.status !== 201) {
            return Toast.fire({
                icon: 'error',
                title: result.message || 'Có lỗi xảy ra'
            });
        }

        return Toast.fire({
            icon: 'success',
            title: result.message 
        });

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        return Toast.fire({
            icon: 'error',
            title: 'Không thể kết nối tới server'
        });
    }
}
