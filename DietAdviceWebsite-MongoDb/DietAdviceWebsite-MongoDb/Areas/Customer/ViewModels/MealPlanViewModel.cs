using System.Collections.Generic;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels
{
    public class MealPlanViewModel
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Date { get; set; }
        public List<MealEatenViewModel> MealsEaten { get; set; }
    }

    public class MealEatenViewModel
    {
        public string MealId { get; set; }
        public string Name { get; set; } // The meal name will be populated here
        public string TimeSlot { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public double CaloriesConsumed { get; set; }
    }
}
