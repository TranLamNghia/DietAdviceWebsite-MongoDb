using System.Threading.Tasks;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using DietAdviceWebsite_MongoDb.Models;
using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class MealPlanController : Controller
    {
        private readonly MealManagementService _mealManagementService;
        private readonly MealPlanService _mealPlanService;
        // private readonly UserService _userService;

        public MealPlanController(MealManagementService mealManagementService, MealPlanService mealPlanService)
        {
            _mealManagementService = mealManagementService;
            _mealPlanService = mealPlanService;
        }

        [HttpGet]
        [Route("customer/meal-plan/index")]
        public async Task<IActionResult> Index()
        {
            var mealPlan = await _mealPlanService.GetTodayMealPlanAsync();
            return View(mealPlan);
        }

        [HttpGet("GetAllMeals")]
        public async Task<JsonResult> GetAllMeals()
        {
            List<Meal> listMeals = await _mealManagementService.GetAsync(null, null);
            return Json(listMeals);
        }
    }
}
