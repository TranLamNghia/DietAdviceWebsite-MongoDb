using System.Threading.Tasks;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels;
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
            var mealPlan = await _mealPlanService.GetTodayMealPlanViewModelAsync();
            return View(mealPlan);
        }

        [HttpGet]
        [Route("customer/meal-plan/get-all-meals")]
        public async Task<JsonResult> GetAllMeals()
        {
            List<Meal> listMeals = await _mealManagementService.GetAsync(null, null);
            return Json(listMeals);
        }

        [HttpPost]
        [Route("customer/meal-plan/add-meal")]
        public async Task<IActionResult> AddMeal(string MealId, string TimeSlot, double Quantity, string Unit) 
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "Invalid data" });
            }

            try
            {
                await _mealPlanService.AddMealToPlanAsync(MealId, TimeSlot, Quantity, Unit);

                var updatedMealPlan = await _mealPlanService.GetTodayMealPlanViewModelAsync();
                return Json(new { success = true, data = updatedMealPlan });
            }
            catch (System.Exception ex)
            {
                // Log the exception
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
