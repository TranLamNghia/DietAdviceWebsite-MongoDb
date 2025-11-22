using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DietAdviceWebsite_MongoDb.Models
{
    public class Meals
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [BsonElement("description")]
        public string Description { get; set; } = null!;

        [BsonElement("image_url")]
        public string? ImageUrl { get; set; }

        [BsonElement("category")]
        public string Category { get; set; } = null!;

        [BsonElement("meal_types")]
        public List<string> MealTypes { get; set; } = null!;

        [BsonElement("nutrition")]
        public NutritionInfo Nutrition { get; set; } = null!;

        [BsonElement("tags")]
        public List<string> Tags { get; set; } = null!;
    }

    public class NutritionInfo
    {
        [BsonElement("calories")]
        public double Calories { get; set; }

        [BsonElement("protein")]
        public double Protein { get; set; }

        [BsonElement("carbs")]
        public double Carbs { get; set; }

        [BsonElement("fats")]
        public double Fats { get; set; }
    }
}
