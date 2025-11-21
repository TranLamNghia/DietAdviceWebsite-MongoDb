// Dữ liệu món ăn đầy đủ (Đã tích hợp từ file JSON của bạn)
const foodData = [
    { _id: "meal_101", name: "Phở Bò Tái", description: "Món nước truyền thống, nước dùng trong, thịt bò tái mềm.", category: "Món nước", nutrition: { calories: 450, protein: 20, carbs: 60, fats: 12 }, tags: ["Món Việt", "Nhiều tinh bột"] },
    { _id: "meal_102", name: "Cơm Trắng", description: "Cơm gạo tẻ nấu chín, hạt mềm dẻo.", category: "Tinh bột", nutrition: { calories: 200, protein: 4.5, carbs: 44, fats: 0.5 }, tags: ["Cơ bản", "Thuần chay", "Ít béo"] },
    { _id: "meal_103", name: "Thịt Kho Tàu", description: "Thịt ba chỉ kho mềm với trứng và nước dừa.", category: "Món mặn", nutrition: { calories: 350, protein: 18, carbs: 8, fats: 28 }, tags: ["Món Việt", "Nhiều chất béo", "Giàu đạm"] },
    { _id: "meal_104", name: "Gỏi Gà Xé", description: "Ức gà xé trộn bắp cải, rau răm và hành phi.", category: "Salad", nutrition: { calories: 280, protein: 32, carbs: 10, fats: 12 }, tags: ["Giảm cân", "Nhiều đạm", "Healthy"] },
    { _id: "meal_105", name: "Bún Chả Hà Nội", description: "Thịt nướng ăn kèm bún, nước mắm pha và rau sống.", category: "Món nước", nutrition: { calories: 520, protein: 25, carbs: 65, fats: 18 }, tags: ["Món Việt", "Nhiều năng lượng"] },
    { _id: "meal_106", name: "Cơm Gà Hải Nam", description: "Cơm được nấu từ nước luộc gà, thịt gà mềm, ăn kèm nước chấm gừng.", category: "Tinh bột", nutrition: { calories: 600, protein: 36, carbs: 70, fats: 18 }, tags: ["Giàu đạm", "Nhiều tinh bột"] },
    { _id: "meal_107", name: "Salad Cá Ngừ", description: "Xà lách, cá ngừ, bắp, trứng luộc, sốt mè rang.", category: "Salad", nutrition: { calories: 320, protein: 28, carbs: 16, fats: 14 }, tags: ["Giảm cân", "Nhiều đạm", "Healthy"] },
    { _id: "meal_108", name: "Súp Lơ Xào Thịt Bò", description: "Thịt bò xào với súp lơ xanh, gừng và tỏi.", category: "Món mặn", nutrition: { calories: 330, protein: 26, carbs: 12, fats: 18 }, tags: ["Ít tinh bột", "Giàu đạm", "Healthy"] },
    { _id: "meal_109", name: "Cháo Yến Mạch", description: "Cháo nấu từ yến mạch, sữa và trái cây.", category: "Tinh bột", nutrition: { calories: 250, protein: 6, carbs: 40, fats: 6 }, tags: ["Healthy", "Nhiều chất xơ"] },
    { _id: "meal_110", name: "Bánh Mì Thịt Nướng", description: "Bánh mì kẹp thịt nướng, đồ chua, pate và rau.", category: "Tinh bột", nutrition: { calories: 480, protein: 23, carbs: 55, fats: 16 }, tags: ["Món Việt", "Nhiều năng lượng"] },
    { _id: "meal_111", name: "Bún Bò Huế", description: "Bún bò cay nhẹ, nước dùng thơm sả.", category: "Món nước", nutrition: { calories: 550, protein: 28, carbs: 68, fats: 20 }, tags: ["Món Việt", "Nhiều tinh bột"] },
    { _id: "meal_112", name: "Salad Trứng", description: "Xà lách, trứng luộc, cà chua bi, sốt chua ngọt.", category: "Salad", nutrition: { calories: 220, protein: 12, carbs: 8, fats: 14 }, tags: ["Healthy", "Ít tinh bột"] },
    { _id: "meal_113", name: "Ốp La + Bánh Mì", description: "Trứng ốp la với bánh mì.", category: "Món mặn", nutrition: { calories: 380, protein: 20, carbs: 34, fats: 18 }, tags: ["Giàu đạm", "Năng lượng cao"] },
    { _id: "meal_114", name: "Hủ Tiếu Nam Vang", description: "Sợi hủ tiếu dai, nước trong, tôm thịt ngọt.", category: "Món nước", nutrition: { calories: 460, protein: 22, carbs: 55, fats: 14 }, tags: ["Món Việt", "Món nước"] },
    { _id: "meal_115", name: "Cơm Tấm Sườn", description: "Cơm tấm sườn nướng, bì, chả.", category: "Tinh bột", nutrition: { calories: 780, protein: 38, carbs: 92, fats: 28 }, tags: ["Nhiều năng lượng", "Món Việt"] },
    { _id: "meal_116", name: "Salad Rau Củ", description: "Salad rau củ luộc nhẹ với dầu oliu.", category: "Salad", nutrition: { calories: 150, protein: 5, carbs: 18, fats: 6 }, tags: ["Thuần chay", "Giảm cân", "Ít calo"] },
    { _id: "meal_118", name: "Sữa Chua Trái Cây", description: "Sữa chua ít béo với chuối, táo và dâu.", category: "Tráng miệng", nutrition: { calories: 180, protein: 7, carbs: 28, fats: 4 }, tags: ["Healthy", "Tốt cho tiêu hóa"] },
    { _id: "meal_119", name: "Sinh Tố Bơ", description: "Sinh tố bơ béo mịn.", category: "Đồ uống", nutrition: { calories: 300, protein: 4, carbs: 22, fats: 24 }, tags: ["Nhiều chất béo tốt", "Tăng cân"] },
    { _id: "meal_120", name: "Gà Luộc", description: "Gà luộc đơn giản, chấm muối tiêu chanh.", category: "Món mặn", nutrition: { calories: 280, protein: 42, carbs: 0, fats: 12 }, tags: ["Nhiều đạm", "Ít tinh bột", "Giảm cân"] },
    { _id: "meal_121", name: "Cá Hồi Áp Chảo", description: "Cá hồi áp chảo với chanh và tiêu.", category: "Món mặn", nutrition: { calories: 380, protein: 34, carbs: 0, fats: 26 }, tags: ["Healthy", "Nhiều omega-3"] },
    { _id: "meal_124", name: "Bánh Xèo Miền Tây", description: "Bánh xèo vỏ giòn, nhân tôm thịt, ăn kèm rau sống.", category: "Món mặn", nutrition: { calories: 480, protein: 22, carbs: 55, fats: 20 }, tags: ["Món Việt", "Đặc sản"] },
    { _id: "meal_136", name: "Canh Chua Cá Lóc", description: "Cá lóc, bạc hà, cà chua, thơm; vị chua ngọt.", category: "Món nước", nutrition: { calories: 260, protein: 28, carbs: 10, fats: 8 }, tags: ["Ngon nhẹ", "Healthy"] },
    { _id: "meal_137", name: "Gỏi Đu Đủ", description: "Đu đủ sợi trộn tôm thịt và đậu phộng.", category: "Salad", nutrition: { calories: 220, protein: 12, carbs: 30, fats: 8 }, tags: ["Healthy", "Ít dầu"] },
    { _id: "meal_141", name: "Lẩu Thái", description: "Lẩu chua cay, hải sản và nấm.", category: "Món nước", nutrition: { calories: 680, protein: 40, carbs: 60, fats: 24 }, tags: ["Đậm vị", "Khá cay"] },
    { _id: "meal_142", name: "Cơm Gà Xối Mỡ", description: "Gà chiên giòn vàng ăn kèm cơm thơm.", category: "Món mặn", nutrition: { calories: 780, protein: 36, carbs: 85, fats: 32 }, tags: ["Nhiều calo", "Không phù hợp giảm cân"] },
    { _id: "meal_146", name: "Cơm Chiên Dương Châu", description: "Cơm chiên trứng, lạp xưởng, tôm và đậu Hà Lan.", category: "Món mặn", nutrition: { calories: 650, protein: 28, carbs: 80, fats: 22 }, tags: ["Nhiều tinh bột", "No lâu"] },
    { _id: "meal_149", name: "Phở Gà", description: "Phở gà nước trong, thịt gà xé, hành lá và rau thơm.", category: "Món nước", nutrition: { calories: 420, protein: 32, carbs: 55, fats: 8 }, tags: ["Nhẹ bụng", "Healthy"] },
    { _id: "meal_150", name: "Bánh Mì Ốp La", description: "Bánh mì giòn, trứng ốp la, thịt nguội và pate.", category: "Tinh bột", nutrition: { calories: 520, protein: 24, carbs: 50, fats: 24 }, tags: ["Nhiều năng lượng", "Món sáng"] },
    { _id: "meal_153", name: "Bò Kho Bánh Mì", description: "Thịt bò hầm mềm với cà rốt, sả, hoa hồi, nước sốt đậm đà.", category: "Món nước", nutrition: { calories: 580, protein: 35, carbs: 50, fats: 26 }, tags: ["Món Việt", "Nhiều năng lượng"] },
    { _id: "meal_157", name: "Cháo Lòng", description: "Cháo gạo tẻ ăn kèm lòng heo, hành và tiêu.", category: "Món nước", nutrition: { calories: 480, protein: 26, carbs: 60, fats: 16 }, tags: ["Đậm đà", "Ấm bụng"] },
    { _id: "meal_159", name: "Canh Khổ Qua", description: "Khổ qua nhồi thịt băm, nấu nước trong thanh mát.", category: "Món nước", nutrition: { calories: 200, protein: 18, carbs: 12, fats: 4 }, tags: ["Healthy", "Thanh mát"] }
];

let currentCategoryFilter = 'all';
let currentSearch = '';

// Init
document.addEventListener('DOMContentLoaded', () => {
    initFilterCategories();
    renderFoodGrid(foodData);
});

// 1. Initialize Dynamic Filters based on Categories
function initFilterCategories() {
    // Lấy tất cả các category duy nhất từ dữ liệu
    const allCategories = foodData.map(item => item.category);
    const uniqueCategories = [...new Set(allCategories)].sort(); // Sắp xếp theo alphabet

    const container = document.getElementById('filterContainer');

    // Render Buttons
    uniqueCategories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-tag';
        btn.innerText = category;
        btn.onclick = function () { filterByCategory(category, this); };
        container.appendChild(btn);
    });
}

// 2. Render Grid
function renderFoodGrid(data) {
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center; grid-column: 1/-1; padding: 40px; color:#999;">
                <i class="fas fa-utensils" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Không tìm thấy món ăn nào phù hợp với từ khóa "${currentSearch}".</p>
            </div>`;
        return;
    }

    data.forEach(item => {
        // Render tags html
        const tagsHtml = item.tags.slice(0, 3).map(tag =>
            `<span class="mini-tag">${tag}</span>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="card-tags-wrapper">
                ${tagsHtml}
            </div>
            <div class="card-header">
                <div class="card-title">
                    <h3>${item.name}</h3>
                </div>
            </div>
            <p class="card-desc">${item.description}</p>
            
            <div class="nutrition-box">
                <div class="nutri-col">
                    <span class="nutri-label">Calo</span>
                    <span class="nutri-val" style="color: #ff6347;">${item.nutrition.calories}</span>
                </div>
                <div class="nutri-col">
                    <span class="nutri-label">Pro</span>
                    <span class="nutri-val" style="color: #1e90ff;">${item.nutrition.protein}</span>
                </div>
                <div class="nutri-col">
                    <span class="nutri-label">Carb</span>
                    <span class="nutri-val" style="color: #ffc107;">${item.nutrition.carbs}</span>
                </div>
                <div class="nutri-col">
                    <span class="nutri-label">Fat</span>
                    <span class="nutri-val" style="color: #6c757d;">${item.nutrition.fats}</span>
                </div>
            </div>
            
            <div class="card-footer">
                <a href="/FoodDetail?id=${item._id}" class="btn-view-detail">
                    Xem chi tiết
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. Filtering Logic
function filterByCategory(category, btnElement) {
    currentCategoryFilter = category;

    // Update active UI
    document.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    applyFilters();
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearIcon = document.getElementById('clearSearch');
    const searchWrapper = searchInput.parentElement;

    currentSearch = searchInput.value.toLowerCase();

    applyFilters();
}

function applyFilters() {
    let filtered = foodData;

    // Filter by Category
    if (currentCategoryFilter !== 'all') {
        filtered = filtered.filter(item => item.category === currentCategoryFilter);
    }

    // Filter by Search
    if (currentSearch) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(currentSearch) ||
            item.description.toLowerCase().includes(currentSearch)
        );
    }

    renderFoodGrid(filtered);
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = ''; // Xóa nội dung input
    searchInput.focus(); // Focus lại vào ô input
    handleSearch(); // Gọi lại hàm search để cập nhật UI (ẩn nút clear và reset filter)
}