using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Areas.Admin.Services;
namespace DietAdviceWebsite_MongoDb.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class HomeController : Controller
    {
        private readonly UserAdminService _userService;
        private readonly MealAdminService _mealService;
        public HomeController(UserAdminService userService, MealAdminService mealService)
        {
            _userService = userService;
            _mealService = mealService;
        }
        public async Task<IActionResult> Index()
        {
            long totalUsers = await _userService.GetTotalUsersAsync();
            long totalMeals = await _mealService.GetTotalMealsAsync();

            // 4. Gửi sang View bằng ViewBag
            ViewBag.TotalUsers = totalUsers;
            ViewBag.TotalMeals = totalMeals;

            return View();
        }
    }
}
