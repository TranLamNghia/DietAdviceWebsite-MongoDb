using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class MealManagementController : Controller
    {
        private readonly MealsManagementService _service;

        public MealManagementController(MealsManagementService service)
        {
            _service = service;
        }

        [HttpGet]
        [Route("/customer/meal-management/index")]
        public async Task<IActionResult> Index()
        {
            List<Meal> allMeals = await _service.GetAsync(null, null);

            // 🛡️ FIX NULL NUTRITION
            foreach (var meal in allMeals)
            {
                if (meal.Nutrition == null)
                {
                    meal.Nutrition = new NutritionInfo
                    {
                        Calories = 0,
                        Protein = 0,
                        Carbs = 0,
                        Fats = 0
                    };
                }
            }

            // 🛡️ FIX NULL CATEGORY
            ViewBag.Categories = allMeals
                .Where(m => !string.IsNullOrEmpty(m.Category))
                .Select(m => m.Category)
                .Distinct()
                .ToList();

            return View(allMeals);
        }

    }
}
