using DietAdviceWebsite_MongoDb.Areas.ViewModel;
using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("MongoDb"));
            var database = client.GetDatabase("DietAdviceDB");

            _users = database.GetCollection<User>("users");
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task SaveUserAsync(User user)
        {
            await _users.ReplaceOneAsync(x => x.Id == user.Id, user, new ReplaceOptions { IsUpsert = true });
        }
    }
}
