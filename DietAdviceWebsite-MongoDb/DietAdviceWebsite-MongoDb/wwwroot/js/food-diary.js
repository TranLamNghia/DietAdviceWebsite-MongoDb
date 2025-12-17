document.addEventListener("DOMContentLoaded", function () {
    const prevDayBtn = document.getElementById("prevDay");
    const nextDayBtn = document.getElementById("nextDay");
    const dateDisplay = document.getElementById("dateDisplay");
    const mealListContainer = document.getElementById("mealList");

    const summaryTotals = {
        calories: document.getElementById("totalCalories"),
        protein: document.getElementById("totalProtein"),
        carbs: document.getElementById("totalCarbs"),
        fat: document.getElementById("totalFat")
    };

    function changeDate(date) {
        // Hiệu ứng mờ để biết đang load
        mealListContainer.style.opacity = "0.5";

        fetch(`/customer/food-diary/get-diary-data?date=${date}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                updateUI(data);
            })
            .catch(error => {
                console.error('Lỗi tải dữ liệu:', error);
            })
            .finally(() => {
                mealListContainer.style.opacity = "1";
            });
    }

    function updateUI(data) {
        // 1. Cập nhật ngày
        const currentDate = new Date(data.currentDate);
        dateDisplay.textContent = currentDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const prevDate = new Date(currentDate);
        prevDate.setDate(currentDate.getDate() - 1);
        prevDayBtn.setAttribute("data-date", formatDateISO(prevDate));

        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        nextDayBtn.setAttribute("data-date", formatDateISO(nextDate));

        // 2. Cập nhật Tổng (Check null an toàn)
        if (summaryTotals.calories) summaryTotals.calories.textContent = Math.round(data.totalCalories).toLocaleString();
        if (summaryTotals.protein) summaryTotals.protein.textContent = Math.round(data.totalProtein).toLocaleString();
        if (summaryTotals.carbs) summaryTotals.carbs.textContent = Math.round(data.totalCarbs).toLocaleString();
        if (summaryTotals.fat) summaryTotals.fat.textContent = Math.round(data.totalFat).toLocaleString();

        // 3. Render danh sách món ăn
        mealListContainer.innerHTML = '';

        if (data.mealGroups && data.mealGroups.length > 0) {
            data.mealGroups.forEach(group => {
                const groupHtml = createMealGroupHTML(group, formatDateISO(currentDate));
                mealListContainer.insertAdjacentHTML('beforeend', groupHtml);
            });
        } else {
            mealListContainer.innerHTML = `
                <div class="card" style="text-align:center;">
                    <p>Không có dữ liệu cho ngày này</p>
                    <a href="/Customer/MealManagement/Index?date=${formatDateISO(currentDate)}" class="btn-add-small" style="color:#27ae60; font-weight:bold; margin-top:10px; display:inline-block;">Bắt đầu thêm món</a>
                </div>`;
        }

        attachToggleListeners();

        handleDailyReview(data);
    }

    function createMealGroupHTML(group, dateString) {
        let detailsHtml = '';

        // Kiểm tra xem có chi tiết món ăn không
        if (group.mealEatenDetails && group.mealEatenDetails.length > 0) {
            group.mealEatenDetails.forEach(detail => {
                const cal = detail.totalCalories || detail.calories || 0;
                const pro = detail.totalProtein || detail.protein || 0;
                const carb = detail.totalCarbs || detail.carbs || 0;
                const fat = detail.totalFat || detail.fat || 0;

                detailsHtml += `
                    <div class="meal-item">
                        <p><strong>${detail.mealName}</strong> (${detail.quantity} ${detail.unit || ''})</p>
                        <p>${Math.round(cal)} kcal • P: ${Math.round(pro)}g • C: ${Math.round(carb)}g • F: ${Math.round(fat)}g</p>
                    </div>
                `;
            });
        } else {
            detailsHtml = '<p style="padding:10px; color:#888; font-style:italic;">Chưa có món ăn nào.</p>';
        }

        return `
            <div class="meal-card">
                <div class="meal-header">
                    <div>
                        <h3>${group.timeSlot}</h3>
                        <p>${Math.round(group.totalCalories)} kcal • P: ${Math.round(group.totalProtein)}g • C: ${Math.round(group.totalCarbs)}g • F: ${Math.round(group.totalFat)}g</p>
                    </div>
                    <button class="meal-toggle">▼</button>
                </div>
                <div class="meal-details">
                    ${detailsHtml}
                </div>
            </div>
        `;
    }

    function formatDateISO(date) {
        const offset = date.getTimezoneOffset();
        const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
        return dateLocal.toISOString().split('T')[0];
    }

    function attachToggleListeners() {
        const headers = document.querySelectorAll(".meal-header");

        headers.forEach(header => {
            header.addEventListener("click", function () {
                const details = this.nextElementSibling;
                const btn = this.querySelector(".meal-toggle");

                if (details && details.classList.contains('meal-details')) {
                    details.classList.toggle('expanded');
                    if (details.classList.contains('expanded')) {
                        details.style.maxHeight = (details.scrollHeight + 5) + "px";
                        if (btn) btn.textContent = "▲";
                    } else {
                        details.style.maxHeight = null;
                        if (btn) btn.textContent = "▼";
                    }
                }
            });
        });
    }

    // Load data for the current date on initial page load
    const today = new Date();
    const initialDate = formatDateISO(today);
    changeDate(initialDate);


    if (prevDayBtn) {
        prevDayBtn.addEventListener("click", function () {
            const date = this.getAttribute("data-date");
            changeDate(date);
        });
    }

    if (nextDayBtn) {
        nextDayBtn.addEventListener("click", function () {
            const date = this.getAttribute("data-date");
            changeDate(date);
        });
    }

    function handleDailyReview(data) {
        const section = document.getElementById("reviewSection");
        const formDiv = document.getElementById("reviewForm");
        const displayDiv = document.getElementById("reviewDisplay");

        // 1. Lấy ngày đang xem (từ dữ liệu trả về)
        // data.currentDate thường có dạng "2023-12-16T00:00:00"
        const viewingStr = data.currentDate.split('T')[0]; // Lấy phần YYYY-MM-DD

        // 2. Tính ngày hôm qua chuẩn xác
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        // Format thành YYYY-MM-DD thủ công để tránh lệch múi giờ
        const yesterdayStr = yesterday.getFullYear() + '-' +
            String(yesterday.getMonth() + 1).padStart(2, '0') + '-' +
            String(yesterday.getDate()).padStart(2, '0');

        // 3. So sánh chuỗi (An toàn hơn so sánh TimeStamp)
        const isYesterday = (viewingStr === yesterdayStr);
        const hasReviewed = data.dailyReview && data.dailyReview.isReviewed;

        console.log("Đang xem ngày:", viewingStr);
        console.log("Hôm qua là:", yesterdayStr);
        console.log("Đã review chưa:", hasReviewed);

        // 4. Logic hiển thị
        if (hasReviewed) {
            section.style.display = "block";
            formDiv.style.display = "none";
            displayDiv.style.display = "block";

            // Render sao tĩnh
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                starsHtml += i <= data.dailyReview.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star text-secondary"></i>';
            }
            document.getElementById("displayStars").innerHTML = starsHtml;
            document.getElementById("displayComment").textContent = data.dailyReview.comment || "";
        }
        else if (isYesterday) {
            // Đúng ngày hôm qua -> Hiện form
            section.style.display = "block";
            formDiv.style.display = "block";
            displayDiv.style.display = "none";
            resetForm();
        }
        else {
            // Không phải hôm qua + Chưa review -> Ẩn
            section.style.display = "none";
        }
    }

    // Hàm reset form
    function resetForm() {
        document.getElementById("ratingInput").value = 0;
        document.getElementById("commentInput").value = "";
        document.getElementById("ratingText").textContent = "";
        // Reset màu sao về xám
        const stars = document.querySelectorAll(".rating-stars i");
        stars.forEach(s => {
            s.classList.remove("fas"); // Xóa class sao đặc
            s.classList.add("far");    // Thêm class sao rỗng
            s.style.color = "#e9ecef"; // Màu xám
        });
    }

    // Render sao tĩnh (Read-only)
    function renderStaticStars(rating) {
        let html = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) html += '<i class="fas fa-star"></i>';
            else html += '<i class="far fa-star text-secondary"></i>';
        }
        document.getElementById("displayStars").innerHTML = html;
    }

    // Xử lý click sao (Form nhập)
    const starIcons = document.querySelectorAll("#reviewForm .rating-stars i");
    starIcons.forEach(star => {
        star.addEventListener("click", function () {
            const val = this.getAttribute("data-value");
            document.getElementById("ratingInput").value = val;

            // Highlight sao
            starIcons.forEach(s => {
                if (s.getAttribute("data-value") <= val) {
                    s.style.color = "#ffc107"; // Vàng
                } else {
                    s.style.color = "#ddd"; // Xám
                }
            });

            // Text mô tả
            const texts = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];
            document.getElementById("ratingText").textContent = texts[val];
        });
    });

    // Xử lý Gửi đánh giá
    document.getElementById("btnSubmitReview").addEventListener("click", function () {
        const rating = document.getElementById("ratingInput").value;
        const comment = document.getElementById("commentInput").value;

        const nextDateStr = document.getElementById("nextDay").getAttribute("data-date");
        const dateObj = new Date(nextDateStr);
        dateObj.setDate(dateObj.getDate() - 1); // Lùi lại 1 ngày từ nút Next là ra ngày hiện tại
        const currentDateStr = dateObj.toISOString().split('T')[0];

        if (rating == 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        // Gửi API
        fetch(`/customer/food-diary/submit-review?date=${currentDateStr}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rating: parseInt(rating),
                comment: comment,
                isReviewed: true
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Toast.fire({ icon: 'success', title: 'Cảm ơn bạn đã đánh giá thực đơn' });

                    document.getElementById("reviewForm").style.display = "none";
                    document.getElementById("reviewDisplay").style.display = "block";
                    renderStaticStars(parseInt(rating));

                    const commentDisplay = comment.trim() === "" ? "Không có nhận xét." : comment;
                    document.getElementById("displayComment").textContent = commentDisplay;
                } else {
                    alert("Lỗi: " + data.message);
                }
            });
    });
});
