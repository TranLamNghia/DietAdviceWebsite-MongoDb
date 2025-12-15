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

        private string userId;
        private string today;

        public MealPlanService(IMongoDatabase database, IOptions<MongoDbSettings> settings, IHttpContextAccessor httpContextAccessor)
        {
            _dailyLogsCollection = database.GetCollection<DailyLog>(settings.Value.DailyLogsCollectionName);
            _usersCollection = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _mealsCollection = database.GetCollection<Meal>(settings.Value.MealsCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<DailyLog> GetTodayMealPlanAsync()
        {
            userId = _httpContextAccessor.HttpContext?.User.FindFirstValue("UserId");

            var todayDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            today = todayDate.ToString("yyyy-MM-dd");

            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }

            return await _dailyLogsCollection.Find(log => log.UserId == userId && log.Date == today).FirstOrDefaultAsync();
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
                dailyLog = await InsertMealPlanAsync();
            }

            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();

            var mealIds = dailyLog.MealsEaten.Select(m => m.MealId).ToList();
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
                DailyCalorieTarget = user.CurrentGoal.DailyCalorieTarget,
                Date = dailyLog.Date,
                MealsEaten = mealsEatenViewModel
            };
        }

        public async Task<List<Meal>> GetMealsByCalorieAsync(int maxCalories)
        {
            return await _mealsCollection.Find(meal => meal.Nutrition.Calories <= maxCalories).ToListAsync();
        }

        public async Task<DailyLog> InsertMealPlanAsync()
        {
            DailyLog newLog = new DailyLog
            {
                Id = ObjectId.GenerateNewId().ToString(),
                UserId = userId,
                Date = today,
                MealsEaten = new List<MealEaten>(),
                DailyReview = new DailyReview()
            };

            await _dailyLogsCollection.InsertOneAsync(newLog);

            return newLog;
        }

        public async Task UpdateMealPlanAsync(string logId, DailyLog updatedLog)
        {
            await _dailyLogsCollection.ReplaceOneAsync(log => log.Id == logId, updatedLog);
        }

        public async Task AddMealToPlanAsync(string mealId, string timeslot, double quantity, string unit)
        {
            if (string.IsNullOrEmpty(userId)) return;

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

            var dailyLog = await GetTodayMealPlanAsync();

            if (dailyLog == null)
            {
                dailyLog = await InsertMealPlanAsync();
            }

            var filter = Builders<DailyLog>.Filter.Eq(log => log.Id, dailyLog.Id);
            var update = Builders<DailyLog>.Update.Push(log => log.MealsEaten, mealEaten);
            await _dailyLogsCollection.UpdateOneAsync(filter, update);
        }

        public async Task<UpdateResult> DeleteFoodItemAsync(string mealId, string timeSlot)
        {
            var currentUserId = _httpContextAccessor.HttpContext?.User.FindFirstValue("UserId");
            if (string.IsNullOrEmpty(currentUserId))
            {
                return null;
            }

            var filter = Builders<DailyLog>.Filter.And(
                Builders<DailyLog>.Filter.Eq(log => log.UserId, currentUserId),
                Builders<DailyLog>.Filter.Eq(log => log.Date, today)
            );

            var update = Builders<DailyLog>.Update.PullFilter(log => log.MealsEaten, m => m.MealId == mealId && m.TimeSlot == "Bửa phụ");

            return await _dailyLogsCollection.UpdateOneAsync(filter, update);
        }

        // Generate a menu for all users based on calorie targets.
        // This is a placeholder for a more complex implementation.
        public async Task GenerateMenusForAllUsers()
        {
            await Task.CompletedTask; // Placeholder to make the method async
        }
    }
}
