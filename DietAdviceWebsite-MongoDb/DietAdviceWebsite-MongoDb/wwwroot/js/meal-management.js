let foodData = [];
let currentCategoryFilter = 'all';
let currentSearch = '';

// Init
document.addEventListener('DOMContentLoaded', async () => {
    // Hiển thị loading...
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px;">Đang tải dữ liệu món ăn...</p>';

    try {
        // Gọi API để lấy dữ liệu thật
        const response = await fetch('/api/foods');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        foodData = await response.json();

        // Khởi tạo bộ lọc và render grid sau khi có dữ liệu
        initFilterCategories();
        renderFoodGrid(foodData);
    } catch (error) {
        console.error('Lỗi không thể tải dữ liệu món ăn:', error);
        grid.innerHTML = '<p style="text-align:center; color: red; grid-column: 1/-1; padding: 40px;">Không thể tải được dữ liệu. Vui lòng thử lại sau.</p>';
    }
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
        // Thêm hình ảnh vào card
        const imageHtml = item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.name}" class="card-img-top">`
            : '<div class="card-img-placeholder"></div>'; // Placeholder nếu không có ảnh

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
                <a href="/FoodDetail?id=${item.id}" class="btn-view-detail">
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