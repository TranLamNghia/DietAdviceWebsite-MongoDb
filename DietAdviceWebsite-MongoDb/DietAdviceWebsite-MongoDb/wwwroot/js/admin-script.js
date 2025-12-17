// Sample dishes data
const dishesData = [
    {
        id: 1,
        name: "Gà Nương Xả Ớt",
        type: "healthy",
        difficulty: "medium",
        time: 30,
        calories: 350,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        description: "Gà nướng với xả và ớt, mang lại hương vị tươi sáng và cay nồn. Đây là một món ăn truyền thống của Việt Nam.",
        ingredients: ["500g gà", "4 cây xả", "3 trái ớt", "2 muỗng mắm", "1 muỗng dầu ăn", "Muối, hạt tiêu"],
        instructions: [
            "Rửa sạch gà, cắt thành miếng vừa ăn",
            "Xả và ớt băm nhỏ, trộn với mắm, dầu ăn",
            "Ướp gà với hỗn hợp xả ớt trong 30 phút",
            "Nướng trên than hoặc lò nướng ở 200°C trong 25 phút",
            "Đảo đều để gà nấu đều trên cả hai mặt"
        ],
        nutrition: { protein: "35g", carbs: "5g", fat: "15g", fiber: "1g" }
    },
    {
        id: 2,
        name: "Mì Xào Rau",
        type: "vegan",
        difficulty: "easy",
        time: 20,
        calories: 280,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b1?w=500",
        description: "Mì xào với đa dạng rau xanh, giàu dinh dưỡng và ngon miệng.",
        ingredients: ["300g mì", "200g rau xanh hỗn hợp", "2 muỗng tương", "1 muỗng dầu ăn", "Tỏi, hành"],
        instructions: ["Luộc mì", "Xào tỏi hành", "Thêm rau xào mềm", "Trộn mì với tương", "Nêm nếp"],
        nutrition: { protein: "12g", carbs: "45g", fat: "8g", fiber: "5g" }
    },
    {
        id: 3,
        name: "Cơm Gạo Lứt",
        type: "diet",
        difficulty: "easy",
        time: 45,
        calories: 250,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        description: "Cơm gạo lứt bổ dưỡng, rất tốt cho sức khỏe.",
        ingredients: ["200g gạo lứt", "400ml nước", "Muối"],
        instructions: ["Rửa gạo lứt kỹ", "Cho gạo vào nồi", "Thêm nước theo tỷ lệ", "Nấu khoảng 45 phút", "Nêm muối vừa phải"],
        nutrition: { protein: "7g", carbs: "50g", fat: "2g", fiber: "4g" }
    },
    {
        id: 4,
        name: "Cá Hấp Chanh Dây",
        type: "healthy",
        difficulty: "medium",
        time: 25,
        calories: 320,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
        description: "Cá hấp với chanh dây, tươi ngon và nhẹ nhàng.",
        ingredients: ["400g cá", "5 trái chanh dây", "2 muỗng nước mắm", "Thơm"],
        instructions: ["Vệ sinh cá", "Cho vào tô", "Thêm chanh dây", "Hấp 20 phút", "Rưới nước mắm"],
        nutrition: { protein: "40g", carbs: "2g", fat: "10g", fiber: "0g" }
    },
    {
        id: 5,
        name: "Salad Xanh Tươi",
        type: "healthy",
        difficulty: "easy",
        time: 10,
        calories: 150,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        description: "Salad rau xanh đa dạng, tươi ngon, giàu vitamin.",
        ingredients: ["200g rau xanh", "100g cà chua", "50g dưa leo", "2 muỗng dầu olive", "Giấm"],
        instructions: ["Rửa rau xanh", "Cắt đều", "Trộn với dầu olive", "Thêm giấm", "Nêm muối"],
        nutrition: { protein: "5g", carbs: "15g", fat: "8g", fiber: "4g" }
    },
    {
        id: 6,
        name: "Súp Rau Cải",
        type: "vegan",
        difficulty: "easy",
        time: 30,
        calories: 120,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
        description: "Súp rau cải nóng hổi, bổ dưỡng và tốt cho tiêu hóa.",
        ingredients: ["300g rau cải", "1 lít nước", "2 muỗng dầu ăn", "Tỏi"],
        instructions: ["Nấu nước", "Thêm rau cải", "Nếm nêp", "Rưới dầu ăn", "Để nóng khi ăn"],
        nutrition: { protein: "4g", carbs: "8g", fat: "5g", fiber: "2g" }
    }
];

let currentDish = null;
let allDishes = [...dishesData];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDishes();
});

// Switch page
function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(pageName + '-page');
    if (page) {
        page.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item')?.classList.add('active');

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'dishes': 'Quản lý Món ăn',
        'detail': 'Chi tiết Món ăn',
        'users': 'Quản lý Người dùng',
        'plans': 'Kế hoạch Ăn',
        'recipes': 'Công thức',
        'settings': 'Cài đặt'
    };

    document.querySelector('.page-title').textContent = titles[pageName] || 'Dashboard';
}

// Load dishes
function loadDishes() {
    const grid = document.getElementById('dishesGrid');
    if (!grid) return;

    grid.innerHTML = allDishes.map(dish => `
        <div class="dish-card" onclick="viewDishDetail(${dish.id})">
            <img src="${dish.image}" alt="${dish.name}" class="dish-card-image">
            <div class="dish-card-content">
                <div class="dish-card-name">${dish.name}</div>
                <div class="dish-card-meta">
                    <span>${dish.time} phút</span>
                    <span>⭐ ${dish.rating}</span>
                </div>
                <span class="dish-card-type">${getDishTypeLabel(dish.type)}</span>
                <div class="dish-card-actions">
                    <button class="btn-view" onclick="viewDishDetail(${dish.id}); event.stopPropagation();">Xem</button>
                    <button class="btn-edit" onclick="editDishCard(${dish.id}); event.stopPropagation();">Sửa</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get dish type label
function getDishTypeLabel(type) {
    const labels = {
        'healthy': 'Lành mạnh',
        'vegan': 'Chay',
        'diet': 'Ăn kiêng',
        'quick': 'Nhanh chóng'
    };
    return labels[type] || type;
}

// View dish detail
function viewDishDetail(id) {
    const dish = allDishes.find(d => d.id === id);
    if (!dish) return;

    currentDish = dish;

    // Fill detail page
    document.getElementById('detailDishName').textContent = dish.name;
    document.getElementById('detailImage').src = dish.image;
    document.getElementById('detailType').textContent = getDishTypeLabel(dish.type);
    document.getElementById('detailDifficulty').textContent = getDifficultyLabel(dish.difficulty);
    document.getElementById('detailTime').textContent = dish.time + ' phút';
    document.getElementById('detailCalories').textContent = dish.calories + ' kcal';
    document.getElementById('detailDescription').textContent = dish.description;

    document.getElementById('detailIngredients').innerHTML = dish.ingredients
        .map(ing => `<li>${ing}</li>`)
        .join('');

    document.getElementById('detailInstructions').innerHTML = dish.instructions
        .map(inst => `<li>${inst}</li>`)
        .join('');

    document.getElementById('detailProtein').textContent = dish.nutrition.protein;
    document.getElementById('detailCarbs').textContent = dish.nutrition.carbs;
    document.getElementById('detailFat').textContent = dish.nutrition.fat;
    document.getElementById('detailFiber').textContent = dish.nutrition.fiber;

    switchPage('detail');
}

function getDifficultyLabel(diff) {
    const labels = {
        'easy': 'Dễ',
        'medium': 'Trung bình',
        'hard': 'Khó'
    };
    return labels[diff] || diff;
}

// Edit dish card
function editDishCard(id) {
    const dish = allDishes.find(d => d.id === id);
    if (!dish) return;

    currentDish = dish;
    document.getElementById('modalTitle').textContent = 'Chỉnh sửa Món ăn';
    document.getElementById('dishName').value = dish.name;
    document.getElementById('dishType').value = dish.type;
    document.getElementById('dishDifficulty').value = dish.difficulty;
    document.getElementById('dishTime').value = dish.time;
    document.getElementById('dishCalories').value = dish.calories;
    document.getElementById('dishDescription').value = dish.description;
    document.getElementById('dishImage').value = dish.image;

    openDishModal();
}

// Open dish modal
function openDishModal() {
    document.getElementById('dishModal').classList.add('active');
    if (!currentDish) {
        document.getElementById('modalTitle').textContent = 'Thêm Món ăn mới';
        document.querySelector('.modal-form').reset();
    }
}

// Close dish modal
function closeDishModal() {
    document.getElementById('dishModal').classList.remove('active');
    currentDish = null;
}

// Save dish
function saveDish(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('dishName').value,
        type: document.getElementById('dishType').value,
        difficulty: document.getElementById('dishDifficulty').value,
        time: parseInt(document.getElementById('dishTime').value),
        calories: parseInt(document.getElementById('dishCalories').value),
        description: document.getElementById('dishDescription').value,
        image: document.getElementById('dishImage').value || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
    };

    if (currentDish) {
        // Update existing
        Object.assign(currentDish, formData);
        alert('Cập nhật thành công!');
    } else {
        // Add new
        const newDish = {
            id: Math.max(...allDishes.map(d => d.id)) + 1,
            ...formData,
            rating: 4.5,
            ingredients: [],
            instructions: [],
            nutrition: { protein: "0g", carbs: "0g", fat: "0g", fiber: "0g" }
        };
        allDishes.push(newDish);
        alert('Thêm thành công!');
    }

    closeDishModal();
    loadDishes();
}

// Delete dish
function deleteDish() {
    if (!currentDish) return;
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    allDishes = allDishes.filter(d => d.id !== currentDish.id);
    switchPage('dishes');
    loadDishes();
    alert('Xóa thành công!');
}

// Edit dish
function editDish() {
    if (!currentDish) return;
    editDishCard(currentDish.id);
}

// Filter dishes
function filterDishes() {
    const search = document.getElementById('dishSearch')?.value.toLowerCase() || '';
    const type = document.getElementById('typeFilter')?.value || '';
    const difficulty = document.getElementById('difficultyFilter')?.value || '';

    allDishes = dishesData.filter(dish => {
        return (dish.name.toLowerCase().includes(search) || search === '') &&
               (dish.type === type || type === '') &&
               (dish.difficulty === difficulty || difficulty === '');
    });

    loadDishes();
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Logout
function logout() {
    alert('Đã đăng xuất!');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('dishModal');
    if (e.target === modal) {
        closeDishModal();
    }
});