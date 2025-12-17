using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class MealsManagementService
    {
        private readonly IMongoCollection<Meal> _mealsCollection;

        public MealsManagementService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _mealsCollection = database.GetCollection<Meal>(settings.Value.MealsCollectionName);
        }

        public async Task<List<Meal>> GetAsync(string? category, string? searchQuery)
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
            return await _mealsCollection.Find(filter).ToListAsync();
        }

        public async Task<Meal> GetMealByIdAsync(string id)
        {
            // Kiểm tra ID có hợp lệ không trước khi query để tránh lỗi Format Exception
            if (string.IsNullOrEmpty(id) || !ObjectId.TryParse(id, out _))
            {
                return null;
            }

            // Tìm món ăn có Id trùng khớp
            return await _mealsCollection.Find(m => m.Id == id).FirstOrDefaultAsync();
        }
    }
}