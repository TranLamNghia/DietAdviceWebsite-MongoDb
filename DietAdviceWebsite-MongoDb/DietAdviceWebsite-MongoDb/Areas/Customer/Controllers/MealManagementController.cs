using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class MealManagementController : Controller
    {
        private readonly MealManagementService _service;

        public MealManagementController(MealManagementService service)
        {
            _service = service;
        }

        [HttpGet]
        [Route("/customer/meal-management/index")]
        public async Task<IActionResult> Index()
        {
            List<Meal> allMeals = await _service.GetAsync(null, null);
            ViewBag.Categories = allMeals.Select(m => m.Category).Distinct().OrderBy(c => c).ToList();

            return View(allMeals);
        }
    }
}
