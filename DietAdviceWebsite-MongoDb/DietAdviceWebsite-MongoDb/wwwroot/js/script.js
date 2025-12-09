let meals = [
    {
        id: 1,
        name: "Cơm gà",
        category: "Carbs",
        calories: 450,
        protein: 35,
        carbs: 50,
        fats: 8,
        description: "Cơm trắng với gà nướng, rau xanh",
    },
    {
        id: 2,
        name: "Trứng ốp la",
        category: "Protein",
        calories: 200,
        protein: 15,
        carbs: 5,
        fats: 15,
        description: "Trứng ốp la với bánh mì nướng",
    },
    {
        id: 3,
        name: "Cá hồi nướng",
        category: "Protein",
        calories: 350,
        protein: 40,
        carbs: 0,
        fats: 20,
        description: "Cá hồi nướng với rau xanh",
    },
    {
        id: 4,
        name: "Salad rau xanh",
        category: "Vegetables",
        calories: 150,
        protein: 8,
        carbs: 20,
        fats: 5,
        description: "Salad rau xanh tươi với dầu olive",
    },
    {
        id: 5,
        name: "Bánh mì kẹp",
        category: "Protein",
        calories: 300,
        protein: 12,
        carbs: 40,
        fats: 10,
        description: "Bánh mì kẹp với thịt lạnh",
    },
    {
        id: 6,
        name: "Mì xào",
        category: "Protein",
        calories: 400,
        protein: 15,
        carbs: 55,
        fats: 12,
        description: "Mì xào với rau và thịt",
    },
    {
        id: 7,
        name: "Canh chua",
        category: "Carbs",
        calories: 120,
        protein: 10,
        carbs: 15,
        fats: 2,
        description: "Canh chua cá với rau",
    },
    {
        id: 8,
        name: "Sữa chua",
        category: "Dairy",
        calories: 100,
        protein: 5,
        carbs: 15,
        fats: 2,
        description: "Sữa chua tự nhiên",
    },
]

let todayMenu = [
    {
        mealType: "breakfast",
        mealName: "Sáng",
        items: [{ id: 2, name: "Trứng ốp la", calories: 200, protein: 15, carbs: 5, fats: 15 }],
    },
    {
        mealType: "lunch",
        mealName: "Trưa",
        items: [
            { id: 1, name: "Cơm gà", calories: 450, protein: 35, carbs: 50, fats: 8 },
            { id: 4, name: "Salad rau xanh", calories: 150, protein: 8, carbs: 20, fats: 5 },
        ],
    },
    {
        mealType: "dinner",
        mealName: "Tối",
        items: [{ id: 3, name: "Cá hồi nướng", calories: 350, protein: 40, carbs: 0, fats: 20 }],
    },
]

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    setupMenuToggle()
})

// Menu toggle for mobile
function setupMenuToggle() {
    const menuToggle = document.getElementById("menuToggle")
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const menu = document.querySelector(".navbar-menu")
            menu.style.display = menu.style.display === "flex" ? "none" : "flex"
        })
    }
}

// Calculate total nutrition
function calculateTotalNutrition(items) {
    return items.reduce(
        (total, item) => ({
            calories: total.calories + item.calories,
            protein: total.protein + item.protein,
            carbs: total.carbs + item.carbs,
            fats: total.fats + item.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
    )
}

// Format date
function formatDate(date) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("vi-VN", options)
}

// Get date key
function getDateKey(date) {
    return date.toISOString().split("T")[0]
}

document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra xem hàm renderTodayMenu có được định nghĩa bởi today-menu.js hay không
    if (typeof renderTodayMenu === 'function') {
        renderTodayMenu()
    }
});