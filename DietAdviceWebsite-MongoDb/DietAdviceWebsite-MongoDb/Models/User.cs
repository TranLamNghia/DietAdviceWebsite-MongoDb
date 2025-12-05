using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace DietAdviceWebsite_MongoDb.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        [BsonElement("_id")]
        public string Id { get; set; } = null!;

        [BsonElement("username")]
        public string Username { get; set; } = null!;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [BsonElement("profile")]
        public Profile Profile { get; set; } = null!;

        [BsonElement("current_goal")]
        public CurrentGoal CurrentGoal { get; set; } = null!;

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; }
    }

    public class Profile
    {
        [BsonElement("full_name")]
        public string FullName { get; set; } = null!;

        [BsonElement("height")]
        public int Height { get; set; }

        [BsonElement("weight")]
        public int Weight { get; set; }

        [BsonElement("gender")]
        public string Gender { get; set; } = null!;

        [BsonElement("birth_year")]
        public int BirthYear { get; set; }

        [BsonElement("activity_level")]
        public string ActivityLevel { get; set; } = null!;

        [BsonElement("allergies")]
        public List<string> Allergies { get; set; } = new List<string>();

        [BsonElement("diet_preference")]
        public string DietPreference { get; set; } = null!;

        [BsonElement("health_condition")]
        public string HealthCondition { get; set; } = null!;
    }

    public class CurrentGoal
    {
        [BsonElement("goal_type")]
        public string GoalType { get; set; } = null!;

        [BsonElement("target_weight")]
        public int TargetWeight { get; set; }

        [BsonElement("target_date")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime TargetDate { get; set; }

        [BsonElement("daily_calorie_target")]
        public int DailyCalorieTarget { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = null!;
    }
}
