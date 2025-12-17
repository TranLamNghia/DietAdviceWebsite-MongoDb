using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DietAdviceWebsite_MongoDb.Areas.Admin.Services
{
    public class UserAdminService
    {
        private readonly IMongoCollection<User> _users;

        public UserAdminService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task SaveUserAsync(User user)
        {
            await _users.ReplaceOneAsync(x => x.Id == user.Id, user,
                new ReplaceOptions { IsUpsert = true });
        }
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _users.Find(x => x.Email == email).FirstOrDefaultAsync();
        }
        public async Task UpdateUser(User user)
        {
            await _users.ReplaceOneAsync(x => x.Id == user.Id, user);
        }
        public async Task<long> GetTotalUsersAsync()
        {
            return await _users.CountDocumentsAsync(new BsonDocument());
        }
    }
}
