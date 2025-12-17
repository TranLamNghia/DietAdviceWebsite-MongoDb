using MongoDB.Driver;
using DietAdviceWebsite_MongoDb.Models;

namespace DietAdviceWebsite_MongoDb.Areas.Admin.Services
{
    public class AccountAdminService
    {
        private readonly IMongoCollection<Account> _accounts;

        public AccountAdminService(IMongoDatabase database)
        {
            _accounts = database.GetCollection<Account>("accounts");
        }

        // Lấy tất cả user
        public async Task<List<Account>> GetAllAsync()
        {
            // Mẹo: Sắp xếp theo Id giảm dần = Sắp xếp theo người mới tạo gần đây nhất
            return await _accounts.Find(_ => true)
                                  .SortByDescending(u => u.Id)
                                  .ToListAsync();
        }

        // Đổi quyền (Update Role)
        public async Task ChangeRoleAsync(string id, string newRole)
        {
            var update = Builders<Account>.Update.Set(u => u.Role, newRole);
            await _accounts.UpdateOneAsync(u => u.Id == id, update);
        }

        // Xóa tài khoản
        public async Task DeleteAsync(string id)
        {
            await _accounts.DeleteOneAsync(u => u.Id == id);
        }
    }
}