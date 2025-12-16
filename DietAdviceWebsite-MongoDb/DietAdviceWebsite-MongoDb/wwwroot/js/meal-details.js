let baseNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
}

let currentMeal = null

function loadMealDetails() {
    const mealId = Number.parseInt(localStorage.getItem("selectedMealId"))
    const meals = JSON.parse(localStorage.getItem("meals") || "[]")
    const meal = meals.find((m) => m.id === mealId)

    if (!meal) {
        alert("Không tìm thấy món ăn")
        window.location.href = "meal-management.html"
        return
    }

    currentMeal = meal

    // Set base nutrition
    baseNutrition = {
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
    }

    // Update page elements
    document.getElementById("mealName").textContent = meal.name
    document.getElementById("mealCategory").textContent = getCategoryName(meal.category)
    document.getElementById("mealDescription").textContent = meal.description || "Món ăn ngon và bổ dưỡng"

    // Set image
    const imgElement = document.getElementById("mealImage")
    if (meal.image) {
        imgElement.src = meal.image
        imgElement.alt = meal.name
    } else {
        imgElement.src = "https://via.placeholder.com/600x400?text=" + encodeURIComponent(meal.name)
        imgElement.alt = meal.name
    }

    // Set tags (if available)
    const tagsContainer = document.getElementById("tagsContainer")
    if (meal.tags && meal.tags.length > 0) {
        tagsContainer.innerHTML = meal.tags
            .map((tag) => `<span class="badge bg-light text-dark border">#${tag}</span>`)
            .join("")
    } else {
        tagsContainer.innerHTML = `<span class="badge bg-light text-dark border">#healthy</span>`
    }

    // Set base nutrition values
    document.getElementById("baseCalories").textContent = meal.calories
    document.getElementById("baseProtein").textContent = meal.protein.toFixed(1)
    document.getElementById("baseCarbs").textContent = meal.carbs.toFixed(1)
    document.getElementById("baseFats").textContent = meal.fats.toFixed(1)

    // Set units (if available)
    const unitSelect = document.getElementById("calUnit")
    if (meal.units && meal.units.length > 0) {
        unitSelect.innerHTML = meal.units
            .map((unit, index) => `<option value="${unit.multiplier || 1}">${unit.name || unit}</option>`)
            .join("")
    } else {
        unitSelect.innerHTML = '<option value="1">Gram (mặc định)</option>'
    }

    // Calculate initial values
    calculateNutrition()

    // Add event listeners
    document.getElementById("calQty").addEventListener("input", calculateNutrition)
    document.getElementById("calUnit").addEventListener("change", calculateNutrition)
}

function calculateNutrition() {
    const quantity = Number.parseFloat(document.getElementById("calQty").value) || 1
    const multiplier = Number.parseFloat(document.getElementById("calUnit").value) || 1

    const totalMultiplier = quantity * multiplier

    // Calculate totals
    const totalCalories = Math.round(baseNutrition.calories * totalMultiplier)
    const totalProtein = (baseNutrition.protein * totalMultiplier).toFixed(1)
    const totalCarbs = (baseNutrition.carbs * totalMultiplier).toFixed(1)
    const totalFats = (baseNutrition.fats * totalMultiplier).toFixed(1)

    // Update display
    document.getElementById("totalResult").textContent = totalCalories
    document.getElementById("totalPro").textContent = totalProtein
    document.getElementById("totalCarbs").textContent = totalCarbs
    document.getElementById("totalFats").textContent = totalFats
}

function getCategoryName(category) {
    const names = {
        carbs: "Carbs",
        protein: "Protein",
        vegetables: "Vegetables",
        fruits: "Fruits",
        nuts: "Nuts",
        dairy: "Dairy",
        breakfast: "Sáng",
        lunch: "Trưa",
        dinner: "Tối",
        snack: "Ăn vặt",
    }
    return names[category] || category
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", loadMealDetails)
