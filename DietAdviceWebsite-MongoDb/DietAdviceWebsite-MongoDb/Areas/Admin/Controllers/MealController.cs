using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Areas.Admin.Services;
using DietAdviceWebsite_MongoDb.Models;
using MongoDB.Driver;
namespace DietAdviceWebsite_MongoDb.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class MealController : Controller
    {
        private readonly MealAdminService _mealService;
        public MealController(MealAdminService mealService)
        {
            _mealService = mealService;
        }
        public async Task<IActionResult> Index(string searchString, string category,string sortOrder)
        {
            ViewData["CurrentFilter"] = searchString;
            ViewData["CurrentCategory"] = category;
            ViewData["CurrentSort"] = sortOrder;
            var meals = await _mealService.GetAsync(category, searchString,sortOrder);
            return View(meals);
        }
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Meal meal, List<string> selectedMealTypes, List<string> selectedTags, string strUnits)
        {
            if (meal.Nutrition == null) meal.Nutrition = new NutritionInfo();
            meal.MealTypes = selectedMealTypes ?? new List<string>();
            meal.Tags = selectedTags ?? new List<string>();
            meal.Units = string.IsNullOrEmpty(strUnits) ? new List<string>() : strUnits.Split(",").Select(s => s.Trim()).ToList();
            await _mealService.CreateAsync(meal);
            return RedirectToAction(nameof(Index));
        }
        [HttpGet]
        public async Task<IActionResult> Details(string id)
        {
            if (string.IsNullOrEmpty(id)) return NotFound();

            var meal = await _mealService.GetByIdAsync(id);
            if (meal == null) return NotFound();

            return View(meal);
        }
        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            if (id == null) return NotFound();

            var meal = await _mealService.GetByIdAsync(id);
            if (meal == null) return NotFound();

            return View(meal); 
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, Meal meal, string[] selectedMealTypes, string[] selectedTags, string strUnits)
        {
            if (id != meal.Id) return NotFound();
            ModelState.Remove("Tags");
            ModelState.Remove("Units");
            ModelState.Remove("MealTypes");
            if (ModelState.IsValid)
            {
                // 1. Lưu MealTypes (Bữa sáng, Bữa trưa...) từ Checkbox
                meal.MealTypes = selectedMealTypes != null ? selectedMealTypes.ToList() : new List<string>();

                // 2. Lưu Tags (Lành mạnh, Keto...) từ Checkbox
                meal.Tags = selectedTags != null ? selectedTags.ToList() : new List<string>();

                // 3. Lưu Units (Tô, Chén...) từ ô nhập text (cắt dấu phẩy)
                if (!string.IsNullOrEmpty(strUnits))
                {
                    meal.Units = strUnits.Split(',')
                                        .Select(x => x.Trim())
                                        .Where(x => !string.IsNullOrEmpty(x))
                                        .ToList();
                }
                else
                {
                    meal.Units = new List<string>();
                }

                await _mealService.UpdateAsync(id, meal);
                return RedirectToAction(nameof(Index));
            }

            return View(meal);
        }
        // Trong MealController.cs

        [HttpGet] // Dùng HttpGet vì JS gọi bằng window.location.href
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return NotFound();
            }

            try
            {
                await _mealService.DeleteAsync(id);

                // (Tùy chọn) Hiện thông báo thành công
                TempData["Success"] = "Đã xóa món ăn thành công!";
            }
            catch (Exception)
            {
                // (Tùy chọn) Hiện thông báo lỗi
                TempData["Error"] = "Có lỗi xảy ra khi xóa!";
            }

            // Xóa xong thì quay về danh sách món ăn
            return RedirectToAction(nameof(Index));
        }
    }
}
