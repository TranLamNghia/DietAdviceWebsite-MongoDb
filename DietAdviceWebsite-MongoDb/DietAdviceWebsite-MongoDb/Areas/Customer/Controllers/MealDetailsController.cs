using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class MealDetailsController : Controller
    {
        private readonly MealsManagementService _mealService;

        public MealDetailsController(MealsManagementService mealService)
        {
            _mealService = mealService;
        }

        [HttpGet]
        [Route("customer/meal/detail/{id}")]
        public async Task<IActionResult> Index(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return NotFound();
            }

            // Gọi Service lấy dữ liệu
            var meal = await _mealService.GetMealByIdAsync(id);

            if (meal == null)
            {
                return NotFound(); // Trả về trang lỗi 404 nếu không tìm thấy món
            }

            // Trả về View cùng với Model là object Meal
            return View(meal);
        }
    }
}
