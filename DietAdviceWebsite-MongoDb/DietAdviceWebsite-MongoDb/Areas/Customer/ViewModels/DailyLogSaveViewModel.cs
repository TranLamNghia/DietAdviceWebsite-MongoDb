namespace DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels
{
    public class DailyLogSaveViewModel
    {
        public string UserId { get; set; }
        public string Date { get; set; }
        public List<MealEatenVM> Meals { get; set; }
    }

    public class MealEatenVM
    {
        public string MealId { get; set; }
        public string Name { get; set; }
        public string TimeSlot { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; }
        public int CaloriesConsumed { get; set; }
    }
}
