using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class MealsManagementService
    {
        private readonly IMongoCollection<Meals> _mealsCollection;

        public MealsManagementService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _mealsCollection = database.GetCollection<Meals>(settings.Value.MealsCollectionName);
        }

        public async Task<List<Meals>> GetAsync(string? category, string? searchQuery)
        {
            var builder = Builders<Meals>.Filter;
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
    }
}