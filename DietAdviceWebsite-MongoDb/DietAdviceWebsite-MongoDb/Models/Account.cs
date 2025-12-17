using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DietAdviceWebsite_MongoDb.Models
{
    public class Account
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("password_hash")]
        public string PasswordHash { get; set; }

        [BsonElement("role")]
        public string Role { get; set; } = "Customer";

    }
}