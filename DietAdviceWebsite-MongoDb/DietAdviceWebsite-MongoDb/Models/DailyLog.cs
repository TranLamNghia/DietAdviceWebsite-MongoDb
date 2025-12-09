using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace DietAdviceWebsite_MongoDb.Models
{
    public class DailyLog
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("user_id")]
        public string UserId { get; set; }

        [BsonElement("date")]
        public string Date { get; set; }

        [BsonElement("meals_eaten")]
        public List<MealEaten> MealsEaten { get; set; }

        [BsonElement("daily_review")]
        public DailyReview DailyReview { get; set; }
    }

    public class MealEaten
    {
        [BsonElement("meal_id")]
        public string MealId { get; set; }

        [BsonElement("time_slot")]
        public string TimeSlot { get; set; }

        [BsonElement("quantity")]
        public double Quantity { get; set; }

        [BsonElement("unit")]
        public string Unit { get; set; }
    }

    public class DailyReview
    {
        [BsonElement("rating")]
        public int Rating { get; set; }

        [BsonElement("comment")]
        public string Comment { get; set; }
    }
}
