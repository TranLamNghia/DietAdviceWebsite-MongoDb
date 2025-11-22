using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> Index(string? category, string? search)
        {
            List<Meals> allMeals = await _service.GetAsync(null, null);
            ViewBag.Categories = allMeals.Select(m => m.Category).Distinct().OrderBy(c => c).ToList();

            List<Meals> filteredMeals = await _service.GetAsync(category, search);

            return View(filteredMeals);
        }
    }
}
