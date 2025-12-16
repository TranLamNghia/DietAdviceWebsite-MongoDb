using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Areas.ViewModels;
using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class DietCalculatorController : Controller
    {
        private readonly UserService _userService;
        private readonly MealService _mealService;
        public DietCalculatorController(UserService userService, MealService mealService)
        {
            _userService = userService;
            _mealService = mealService;
        }
        [HttpGet]
        [Route("customer/diet-calculator/index")]
        public async Task<IActionResult> Index()
        {
            var meals = await _mealService.GetAllAsync();

            var vm = new DietCalculatorViewModel
            {
                Meals = meals
            };

            return View(vm);
        }
        // POST: Lưu dữ liệu tính toán vào MongoDB
        [HttpPost]
        [Route("customer/diet-calculator/save")]
        public async Task<IActionResult> SaveDietData([FromBody] DietSaveViewModel vm)
        {
            if (!ModelState.IsValid)
<<<<<<< Updated upstream
                return BadRequest("Dữ liệu không hợp lệ.");
=======
            {

                return BadRequest(ModelState);
            }
>>>>>>> Stashed changes

            // Lấy user trong DB (nếu chưa có → tạo mới)
            var user = await _userService.GetUserByIdAsync(vm.UserId);
            string activityText = vm.ActivityLevel switch
            {
                <= 1.2 => "Ít vận động",
                <= 1.375 => "Vận động nhẹ",
                <= 1.55 => "Vận động vừa",
                <= 1.725 => "Năng động",
                _ => "Rất năng động"
            };

            if (user == null)
            {
                user = new User
                {
                    Id = vm.UserId,
                    Username = vm.FullName.Replace(" ", "").ToLower(),
                    Email = "unknown@example.com", // Có thể đổi theo hệ thống của bạn
                    CreatedAt = DateTime.UtcNow
                };
            }

            // Gán lại profile
            user.Profile = new Profile
            {
                FullName = vm.FullName,
                Height = vm.Height,
                Weight = vm.Weight,
                Gender = vm.Gender == "male" ? "Nam" : "Nữ",
                BirthYear = DateTime.UtcNow.Year - vm.Age,
                ActivityLevel = activityText,
                DietPreference = "normal",
                HealthCondition = "none",
                Allergies = new List<string>()
            };

            // Gán mục tiêu
            user.CurrentGoal = new CurrentGoal
            {
                GoalType = vm.GoalType switch
                {
                    "lose" => "Giảm cân",
                    "gain" => "Tăng cân",
                    _ => "Giữ cân"
                },
                TargetWeight = vm.TargetWeight,
                DailyCalorieTarget = vm.DailyCalorieTarget,
                TargetDate = DateTime.UtcNow.AddMonths(2),
                Status = "active"
            };

            // Lưu vào MongoDB
            await _userService.SaveUserAsync(user);

            return Ok(new
            {
                message = "Đã lưu dữ liệu chế độ ăn thành công!",
                userId = user.Id
            });
        }
    }
}
