using System;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels
{
    public class DietSaveViewModel
    {
        public string UserId { get; set; } = null!;
        public int Height { get; set; }
        public int Weight { get; set; }
        public string Gender { get; set; } = null!;
        public int Age { get; set; }
        public double ActivityLevel { get; set; }

        public string GoalType { get; set; } = null!;
        public int TargetWeight { get; set; }
        public int DailyCalorieTarget { get; set; }
    }
}
