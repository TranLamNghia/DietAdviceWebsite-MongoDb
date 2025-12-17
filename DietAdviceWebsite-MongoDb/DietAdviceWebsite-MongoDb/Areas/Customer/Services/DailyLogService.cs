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

        public async Task<DailyLog> GetOrCreateByUserIdAndDateAsync(string userId, DateTime date)
        {
            var dateString = date.ToString("yyyy-MM-dd");
            var log = await GetByUserIdAndDateAsync(userId, dateString);
            if (log == null)
            {
                log = new DailyLog
                {
                    UserId = userId,
                    Date = date.ToString("yyyy-MM-dd"),
                    MealsEaten = new List<MealEaten>(),
                    DailyReview = new DailyReview()
                };
            }
            return log;
        }

        public async Task SaveAsync(DailyLog log)
        {
            await _collection.ReplaceOneAsync(
                x => x.UserId == log.UserId && x.Date == log.Date,
                log,
                new ReplaceOptions { IsUpsert = true }
            );
        }

        public async Task UpdateDailyReviewAsync(string userId, DateTime date, int rating, string comment)
        {
            var filter = Builders<DailyLog>.Filter.And(
                Builders<DailyLog>.Filter.Eq(x => x.UserId, userId),
                Builders<DailyLog>.Filter.Eq(x => x.Date, date.ToString("yyyy-MM-dd"))
            );

            var update = Builders<DailyLog>.Update
                .Set(x => x.DailyReview.Rating, rating)
                .Set(x => x.DailyReview.Comment, comment);

            await _collection.UpdateOneAsync(filter, update);
        }
    }
}
