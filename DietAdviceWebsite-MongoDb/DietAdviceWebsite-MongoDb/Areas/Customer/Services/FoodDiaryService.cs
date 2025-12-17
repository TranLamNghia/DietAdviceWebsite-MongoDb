using DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class FoodDiaryService
    {
        private readonly DailyLogService _dailyLogService;
        private readonly MealService _mealService;

        public FoodDiaryService(DailyLogService dailyLogService, MealService mealService)
        {
            _dailyLogService = dailyLogService;
            _mealService = mealService;
        }

        public async Task<FoodDiaryViewModel> GetFoodDiaryViewModelAsync(string userId, DateTime date)
        {
            var log = await _dailyLogService.GetOrCreateByUserIdAndDateAsync(userId, date);

            var mealEatenDetails = new List<MealEatenDetail>();
            if (log.MealsEaten != null)
            {
                foreach (var mealEaten in log.MealsEaten)
                {
                    var meal = await _mealService.GetByIdAsync(mealEaten.MealId);
                    if (meal != null)
                    {
                        mealEatenDetails.Add(new MealEatenDetail
                        {
                            MealId = meal.Id,
                            MealName = meal.Name,
                            Quantity = mealEaten.Quantity,
                            Unit = mealEaten.Unit,
                            Calories = meal.Nutrition.Calories * mealEaten.Quantity,
                            Protein = meal.Nutrition.Protein * mealEaten.Quantity,
                            Carbs = meal.Nutrition.Carbs * mealEaten.Quantity,
                            Fat = meal.Nutrition.Fats * mealEaten.Quantity,
                            TimeSlot = mealEaten.TimeSlot
                        });
                    }
                }
            }

            var mealGroups = mealEatenDetails.GroupBy(m => m.TimeSlot)
                .Select(g => new MealEatenGroup
                {
                    TimeSlot = g.Key,
                    MealEatenDetails = g.ToList(),
                    TotalCalories = g.Sum(m => m.Calories),
                    TotalProtein = g.Sum(m => m.Protein),
                    TotalCarbs = g.Sum(m => m.Carbs),
                    TotalFat = g.Sum(m => m.Fat)
                }).ToList();

            var sortOrder = new List<string> { "Bữa Sáng", "Bữa Trưa", "Bữa Tối", "Bữa Phụ" };
            mealGroups = mealGroups.OrderBy(g => sortOrder.IndexOf(g.TimeSlot.Trim())).ToList();

            var reviewVM = new DailyReviewViewModel();

            // --- LOGIC TÍNH TOÁN Ở ĐÂY ---
            // Kiểm tra: Nếu object tồn tại VÀ số sao > 0 thì coi là ĐÃ REVIEW
            if (log.DailyReview != null && log.DailyReview.Rating > 0)
            {
                reviewVM.IsReviewed = true; // <--- Tự gán true
                reviewVM.Rating = log.DailyReview.Rating;
                reviewVM.Comment = log.DailyReview.Comment;
            }
            else
            {
                reviewVM.IsReviewed = false; // <--- Tự gán false
                reviewVM.Rating = 0;
            }

            return new FoodDiaryViewModel
            {
                CurrentDate = date,
                MealGroups = mealGroups,
                TotalCalories = mealGroups.Sum(g => g.TotalCalories),
                TotalProtein = mealGroups.Sum(g => g.TotalProtein),
                TotalCarbs = mealGroups.Sum(g => g.TotalCarbs),
                TotalFat = mealGroups.Sum(g => g.TotalFat),
                DailyReview = reviewVM
            };
        }
    }
}
