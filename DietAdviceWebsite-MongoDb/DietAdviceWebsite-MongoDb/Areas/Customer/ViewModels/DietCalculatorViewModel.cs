using DietAdviceWebsite_MongoDb.Models;
using System.Collections.Generic;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels
{
    public class DietCalculatorViewModel
    {
        public List<Meal> Meals { get; set; } = new();
    }
}
