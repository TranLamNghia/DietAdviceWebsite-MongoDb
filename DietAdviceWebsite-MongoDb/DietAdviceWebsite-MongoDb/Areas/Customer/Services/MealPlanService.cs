using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels;
using System.Linq;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class MealPlanService
    {
        private readonly IMongoCollection<DailyLog> _dailyLogsCollection;
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Meal> _mealsCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly string _userId;

        public MealPlanService(IMongoDatabase database, IOptions<MongoDbSettings> settings, IHttpContextAccessor httpContextAccessor)
        {
            _dailyLogsCollection = database.GetCollection<DailyLog>(settings.Value.DailyLogsCollectionName);
            _usersCollection = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _mealsCollection = database.GetCollection<Meal>(settings.Value.MealsCollectionName);
            _httpContextAccessor = httpContextAccessor;

            //_userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _userId = "69324f2f1d64e3ff440446cf";
        }

        public async Task<DailyLog> GetTodayMealPlanAsync()
        {
            if (string.IsNullOrEmpty(_userId))
            {
                return null;
            }

            var todayDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            // var today = todayDate.ToString("yyyy-MM-dd");
            var today = "2025-11-20";

            return await _dailyLogsCollection.Find(log => log.UserId == _userId && log.Date == today).FirstOrDefaultAsync();
        }

        private double CalculateCalories(Meal meal, double quantity, string unit)
        {
           if (meal == null) return 0;

            return meal.Nutrition.Calories * quantity;
        }

        public async Task<MealPlanViewModel> GetTodayMealPlanViewModelAsync()
        {
            var dailyLog = await GetTodayMealPlanAsync();
            if (dailyLog == null)
            {
                return new MealPlanViewModel
                {
                    Id = null, // Hoặc một giá trị mặc định
                    UserId = _userId,
                    Date = "2025-11-20", // Ngày hardcode hiện tại
                    MealsEaten = new List<MealEatenViewModel>()
                };
            }
            
            var mealIds = dailyLog.MealsEaten.Select(m => m.MealId).ToList();
            //lấy bữa ăn từ id
            var mealsFilter = Builders<Meal>.Filter.In(m => m.Id, mealIds);
            var meals = await _mealsCollection.Find(mealsFilter).ToListAsync();
            var mealsDictionary = meals.ToDictionary(m => m.Id);

            var mealsEatenViewModel = dailyLog.MealsEaten.Select(me => new MealEatenViewModel
            {
                MealId = me.MealId,
                Name = mealsDictionary.TryGetValue(me.MealId, out var mealName) ? mealName.Name : "Unknown Meal",
                TimeSlot = me.TimeSlot,
                Quantity = me.Quantity,
                Unit = me.Unit,
                CaloriesConsumed = mealsDictionary.TryGetValue(me.MealId, out var meal) ? CalculateCalories(meal, me.Quantity, me.Unit) : 0
            }).ToList();

            return new MealPlanViewModel
            {
                Id = dailyLog.Id,
                UserId = dailyLog.UserId,
                Date = dailyLog.Date,
                MealsEaten = mealsEatenViewModel
            };
        }

        public async Task<List<Meal>> GetMealsByCalorieAsync(int maxCalories)
        {
            return await _mealsCollection.Find(meal => meal.Nutrition.Calories <= maxCalories).ToListAsync();
        }

        public async Task InsertMealPlanAsync(DailyLog newLog)
        {
            await _dailyLogsCollection.InsertOneAsync(newLog);
        }

        public async Task UpdateMealPlanAsync(string logId, DailyLog updatedLog)
        {
            await _dailyLogsCollection.ReplaceOneAsync(log => log.Id == logId, updatedLog);
        }

        public async Task AddMealToPlanAsync(string mealId, string timeslot, double quantity, string unit)
        {
            if (string.IsNullOrEmpty(_userId)) return;
        
            var mealToAdd = await _mealsCollection.Find(m => m.Id == mealId).FirstOrDefaultAsync();
            if (mealToAdd == null)
            {
                return; // Meal not found
            }
        
            var mealEaten = new MealEaten
            {
                MealId = mealToAdd.Id,
                TimeSlot = timeslot,
                Quantity = quantity,
                Unit = unit
            };
        
            // Lấy log của ngày hôm nay
            var dailyLog = await GetTodayMealPlanAsync();
        
            if (dailyLog != null)
            {
                var filter = Builders<DailyLog>.Filter.Eq(log => log.Id, dailyLog.Id);
                var update = Builders<DailyLog>.Update.Push(log => log.MealsEaten, mealEaten);
                await _dailyLogsCollection.UpdateOneAsync(filter, update);
            }
            else
            {
                var today = "2025-11-20"; // Sử dụng lại ngày hardcode
                var newLog = new DailyLog
                {
                    UserId = _userId,
                    Date = today,
                    MealsEaten = new List<MealEaten> { mealEaten },
                    DailyReview = new DailyReview()
                };
                await _dailyLogsCollection.InsertOneAsync(newLog);
            }
        }

        // Delete a food item from a meal plan
        public async Task DeleteFoodItemAsync(string mealId)
        {
            if (string.IsNullOrEmpty(_userId))
            {
                return;
            }
            var todayDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            var today = todayDate.ToString("yyyyMMdd");
            var logId = $"log_{today}_{_userId}";

            var filter = Builders<DailyLog>.Filter.Eq(log => log.Id, logId);
            var update = Builders<DailyLog>.Update.PullFilter(log => log.MealsEaten, meal => meal.MealId == mealId);

            await _dailyLogsCollection.UpdateOneAsync(filter, update);
        }

        // Generate a menu for all users based on calorie targets.
        // This is a placeholder for a more complex implementation.
        public async Task GenerateMenusForAllUsers()
        {
            await Task.CompletedTask; // Placeholder to make the method async
        }
    }
}
