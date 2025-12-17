using DietAdviceWebsite_MongoDb.Models;
using MongoDB.Driver;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Services
{
    public class DailyLogService
    {
        private readonly IMongoCollection<DailyLog> _collection;

        public DailyLogService(IMongoDatabase database)
        {
            _collection = database.GetCollection<DailyLog>("daily_logs");
        }

        public async Task<DailyLog> GetByUserIdAndDateAsync(string userId, string date)
        {
            return await _collection.Find(x => x.UserId == userId && x.Date == date).FirstOrDefaultAsync();
        }

        public async Task SaveAsync(DailyLog log)
        {
            await _collection.ReplaceOneAsync(
                x => x.UserId == log.UserId && x.Date == log.Date,
                log,
                new ReplaceOptions { IsUpsert = true }
            );
        }
    }
}
