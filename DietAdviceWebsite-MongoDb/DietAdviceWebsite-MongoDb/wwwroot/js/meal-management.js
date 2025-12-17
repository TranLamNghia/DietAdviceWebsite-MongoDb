// Global state for filters
let currentCategoryFilter = 'all';
let currentSearch = '';

/**
 * Filters the displayed food cards based on a selected category.
 * @param {string} category The category to filter by ('all' for no filter).
 * @param {HTMLElement} btnElement The button element that was clicked.
 */
function filterByCategory(category, btnElement) {
    currentCategoryFilter = category;

    // Update active class on filter buttons
    document.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    applyFilters();
}

/**
 * Handles the search input and triggers filtering.
 */
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    currentSearch = searchInput.value.toLowerCase();
    applyFilters();
}

/**
 * Applies the current category and search filters to the food cards in the DOM.
 */
function applyFilters() {
    const foodCards = document.querySelectorAll('.food-card');

    foodCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardName = card.dataset.name; // Assumes data-name is already in lowercase

        // Check if the card matches the current filters
        const categoryMatch = (currentCategoryFilter === 'all' || currentCategoryFilter === cardCategory);
        const searchMatch = (cardName.includes(currentSearch));

        // Show or hide the card
        if (categoryMatch && searchMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}