using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

public class MealService
{
    private readonly IMongoCollection<Meal> _meals;

    public MealService(IMongoDatabase database)
    {
        _meals = database.GetCollection<Meal>("meals");
    }

    public async Task<List<Meal>> GetAllAsync()
        => await _meals.Find(_ => true).ToListAsync();
}
