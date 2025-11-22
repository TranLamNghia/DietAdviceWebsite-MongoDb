namespace DietAdviceWebsite_MongoDb.Models
{
    public class MongoDbSettings 
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string MealsCollectionName { get; set; } = null!;
        public string DailyLogCollectionName { get; set; } = null!;
        public string UserCollectionName { get; set; } = null!;
    }
}
