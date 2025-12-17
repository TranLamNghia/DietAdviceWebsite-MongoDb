using DietAdviceWebsite_MongoDb.Models;
using System;
using System.Collections.Generic;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels
{
    public class FoodDiaryViewModel
    {
        public List<MealEatenGroup> MealGroups { get; set; }
        public DateTime CurrentDate { get; set; }
        public double TotalCalories { get; set; }
        public double TotalProtein { get; set; }
        public double TotalCarbs { get; set; }
        public double TotalFat { get; set; }
        public DailyReviewViewModel DailyReview { get; set; }
    }

    public class MealEatenGroup
    {
        public string TimeSlot { get; set; }
        public List<MealEatenDetail> MealEatenDetails { get; set; }
        public double TotalCalories { get; set; }
        public double TotalProtein { get; set; }
        public double TotalCarbs { get; set; }
        public double TotalFat { get; set; }
    }

    public class MealEatenDetail
    {
        public string MealId { get; set; }
        public string MealName { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public double Calories { get; set; }
        public double Protein { get; set; }
        public double Carbs { get; set; }
        public double Fat { get; set; }
        public string TimeSlot { get; set; }
    }

    public class DailyReviewViewModel
    {
        public int Rating { get; set; }
        public string Comment { get; set; }
        public bool IsReviewed { get; set; }
    }
}
