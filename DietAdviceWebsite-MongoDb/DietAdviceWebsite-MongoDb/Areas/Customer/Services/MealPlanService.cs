using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using DietAdviceWebsite_MongoDb.Models;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class MealPlanService
    {
        private readonly IMongoCollection<DailyLog> _dailyLogsCollection;
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Meal> _mealsCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MealPlanService(IMongoDatabase database, IOptions<MongoDbSettings> settings, IHttpContextAccessor httpContextAccessor)
        {
            _dailyLogsCollection = database.GetCollection<DailyLog>(settings.Value.DailyLogsCollectionName);
            _usersCollection = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _mealsCollection = database.GetCollection<Meal>(settings.Value.MealsCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<DailyLog> GetTodayMealPlanAsync()
        {
            //var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = "user001";
            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }

            var todayDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            var today = todayDate.ToString("yyyyMMdd");
            var id = $"log_{today}_{userId}";

            return await _dailyLogsCollection.Find(log => log.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Meal>> GetMealsByCalorieAsync(int maxCalories)
        {
            return await _mealsCollection.Find(meal => meal.Nutrition.Calories <= maxCalories).ToListAsync();
        }

        // Insert a new meal plan document
        public async Task InsertMealPlanAsync(DailyLog newLog)
        {
            await _dailyLogsCollection.InsertOneAsync(newLog);
        }

        // Update a meal plan
        public async Task UpdateMealPlanAsync(string logId, DailyLog updatedLog)
        {
            await _dailyLogsCollection.ReplaceOneAsync(log => log.Id == logId, updatedLog);
        }
        
        // Add a single meal to today's log based on Meal ID and quantity
        public async Task AddMealToPlanAsync(string mealId, int quantity, string timeslot)
        {
            //var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = "user001";
            if (string.IsNullOrEmpty(userId))
            {
                return; // Or throw an exception
            }

            var mealToAdd = await _mealsCollection.Find(m => m.Id == mealId).FirstOrDefaultAsync();
            if (mealToAdd == null)
            {
                return; // Meal not found
            }

            var mealEaten = new MealEaten
            {
                MealId = mealToAdd.Id,
                Name = mealToAdd.Name,
                TimeSlot = timeslot,
                Quantity = quantity,
                Unit = "g", // Assuming grams, this could be more dynamic
                CaloriesConsumed = (int)Math.Round(mealToAdd.Nutrition.Calories * (quantity / 100.0))
            };

            var todayDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            var today = todayDate.ToString("yyyyMMdd");
            var logId = $"log_{today}_{userId}";

            var filter = Builders<DailyLog>.Filter.Eq(log => log.Id, logId);
            var update = Builders<DailyLog>.Update.Push(log => log.MealsEaten, mealEaten);

            var result = await _dailyLogsCollection.UpdateOneAsync(filter, update);

            // If no log exists for today, create one
            if (result.MatchedCount == 0)
            {
                var newLog = new DailyLog
                {
                    Id = logId,
                    UserId = userId,
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
            //var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = "user001";
             if (string.IsNullOrEmpty(userId))
            {
                return;
            }
            var todayDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            var today = todayDate.ToString("yyyyMMdd");
            var logId = $"log_{today}_{userId}";

            var filter = Builders<DailyLog>.Filter.Eq(log => log.Id, logId);
            var update = Builders<DailyLog>.Update.PullFilter(log => log.MealsEaten, meal => meal.MealId == mealId);

            await _dailyLogsCollection.UpdateOneAsync(filter, update);
        }

        // Generate a menu for all users based on calorie targets.
        // This is a placeholder for a more complex implementation.
        public async Task GenerateMenusForAllUsers()
        {
            // In a real implementation, you would:
            // 1. Get all users:
            //    var users = await _usersCollection.Find(_ => true).ToListAsync();
            //
            // 2. Get all available meals (potentially from another service)
            //
            // 3. For each user in users:
            //    a. Get their target_calories.
            //    b. Build a meal plan (a list of MealEaten) that approximates this target.
            //       This is a complex algorithm (e.g., a variation of the knapsack problem).
            //    c. Create a new DailyLog for the user for the current day.
            //    d. Insert the new log into the database.

            await Task.CompletedTask; // Placeholder to make the method async
        }
    }
}
