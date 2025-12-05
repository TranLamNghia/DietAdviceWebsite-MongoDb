using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DietAdviceWebsite_MongoDb.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = null!;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        // Cho phép Null để đăng ký nhanh
        [BsonElement("profile")]
        public UserProfile? Profile { get; set; }

        // Cho phép Null
        [BsonElement("current_goal")]
        public UserGoal? CurrentGoal { get; set; }

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserProfile
    {
        [BsonElement("full_name")]
        public string FullName { get; set; } = null!;

        [BsonElement("height")]
        public double Height { get; set; } = 0;

        [BsonElement("weight")]
        public double Weight { get; set; } = 0;

        [BsonElement("gender")]
        public string Gender { get; set; } = "Chưa xác định";

        [BsonElement("birth_year")]
        public int BirthYear { get; set; } = 0;

        [BsonElement("activity_level")]
        public string ActivityLevel { get; set; } = "Ít vận động";

        [BsonElement("allergies")]
        public List<string> Allergies { get; set; } = new List<string>();

        [BsonElement("diet_preference")]
        public string DietPreference { get; set; } = "Không có";

        [BsonElement("health_condition")]
        public string HealthCondition { get; set; } = "Không có";
    }

    public class UserGoal
    {
        [BsonElement("goal_type")]
        public string GoalType { get; set; } = "Duy trì";

        [BsonElement("target_weight")]
        public double TargetWeight { get; set; }

        [BsonElement("daily_calorie_target")]
        public int DailyCalorieTarget { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Đang thực hiện";
    }
}