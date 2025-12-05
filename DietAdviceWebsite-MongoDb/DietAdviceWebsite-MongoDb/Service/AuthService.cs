using DietAdviceWebsite_MongoDb.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DietAdviceWebsite_MongoDb.Service
{
    public class AuthService
    {
        private readonly IMongoCollection<Account> _accounts;
        private readonly IMongoCollection<User> _users;

        public AuthService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _accounts = database.GetCollection<Account>(settings.Value.AccountCollectionName);
            _users = database.GetCollection<User>(settings.Value.UserCollectionName);
        }

        public async Task<string> RegisterAsync(string email, string password, string fullName)
        {
            var existingAccount = await _accounts.Find(x => x.Email == email).FirstOrDefaultAsync();
            if (existingAccount != null)
            {
                return "Email này đã được sử dụng!";
            }

            string newUserId = ObjectId.GenerateNewId().ToString();

            var newAccount = new Account
            {
                Id = newUserId,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = "Customer"
            };

            var newUser = new User
            {
                Id = newUserId,
                Email = email,
                Username = email.Split('@')[0],
                CreatedAt = DateTime.UtcNow,

                Profile = new UserProfile
                {
                    FullName = fullName,
                },

                CurrentGoal = null
            };

            var task1 = _accounts.InsertOneAsync(newAccount);
            var task2 = _users.InsertOneAsync(newUser);

            await Task.WhenAll(task1, task2);

            return "Success"; 
        }

        public async Task<Account> ValidateLoginAsync(string email, string password)
        {
            var account = await _accounts.Find<Account>(x => x.Email == email).FirstOrDefaultAsync();

            if (account == null)
            {
                return null;
            }
            bool isValidPassword = BCrypt.Net.BCrypt.Verify(password, account.PasswordHash);
            if (isValidPassword)
            {
                return account;
            }
            return null;
        }
    }
}
