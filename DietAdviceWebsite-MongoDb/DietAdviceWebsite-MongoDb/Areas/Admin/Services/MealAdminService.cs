using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Admin.Services
{
    public class MealAdminService
    {
        private readonly IMongoCollection<Meal> _mealsCollection;

        public MealAdminService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _mealsCollection = database.GetCollection<Meal>(settings.Value.MealsCollectionName);
        }

        public async Task<List<Meal>> GetAsync(string? category, string? searchQuery,string sortOrder)
        {
            var builder = Builders<Meal>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrEmpty(category) && category.ToLower() != "all")
            {
                filter &= builder.Eq(x => x.Category, category);
            }

            if (!string.IsNullOrEmpty(searchQuery))
            {
                var searchFilter = builder.Regex(x => x.Name, new BsonRegularExpression(searchQuery, "i")) |
                                   builder.Regex(x => x.Description, new BsonRegularExpression(searchQuery, "i"));
                filter &= searchFilter;
            }
            var sort = Builders<Meal>.Sort.Descending(m => m.Id); // Mặc định là Mới nhất lên đầu

            switch (sortOrder)
            {
                case "oldest": // Cũ nhất lên đầu
                    sort = Builders<Meal>.Sort.Ascending(m => m.Id);
                    break;
                case "name_asc": // Tên A-Z
                    sort = Builders<Meal>.Sort.Ascending(m => m.Name);
                    break;
                case "name_desc": // Tên Z-A
                    sort = Builders<Meal>.Sort.Descending(m => m.Name);
                    break;
                default: // Mặc định (newest)
                    sort = Builders<Meal>.Sort.Descending(m => m.Id);
                    break;
            }
            return await _mealsCollection.Find(filter).Sort(sort).ToListAsync();
        }
        public async Task<long> GetTotalMealsAsync()
        {
            return await _mealsCollection.CountDocumentsAsync(new BsonDocument());
        }
        public async Task CreateAsync(Meal meal)
        {
            await _mealsCollection.InsertOneAsync(meal);
        }
        public async Task<Meal> GetByIdAsync(string id)
        {
            return await _mealsCollection.Find(m => m.Id == id).FirstOrDefaultAsync();
        }
        public async Task UpdateAsync(string id, Meal mealin)
        {
            mealin.Id = id;
            await _mealsCollection.ReplaceOneAsync(meal => meal.Id == id, mealin);
        }
        public async Task DeleteAsync(string id)
        {
            // Tìm và xóa món ăn có Id trùng khớp
            await _mealsCollection.DeleteOneAsync(m => m.Id == id);
        }
    }
}