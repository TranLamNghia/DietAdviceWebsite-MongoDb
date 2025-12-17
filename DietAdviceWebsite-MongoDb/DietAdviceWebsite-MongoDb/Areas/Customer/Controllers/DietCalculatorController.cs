using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels;
using MongoDB.Bson;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class DietCalculatorController : Controller
    {
        private readonly DailyLogService _dailyLogService;
        private readonly UserService _userService;
        private readonly MealService _mealService;
        public DietCalculatorController(UserService userService, MealService mealService, DailyLogService dailyLogService)
        {
            _userService = userService;
            _mealService = mealService;
            _dailyLogService = dailyLogService;
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
            {
                return BadRequest(ModelState);
            }

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

            // Ensure profile exists before updating
            if (user.Profile == null)
            {
                user.Profile = new Profile();
            }

            // Update specific profile properties
            user.Profile.Height = vm.Height;
            user.Profile.Weight = vm.Weight;
            user.Profile.Gender = vm.Gender == "male" ? "Nam" : "Nữ";
            user.Profile.BirthYear = DateTime.UtcNow.Year - vm.Age;
            user.Profile.ActivityLevel = activityText;

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
                message = "Đã lưu thông tin người dùng thành công!",
                userId = user.Id
            });
        }
        [HttpPost]
        [Route("customer/diet-calculator/save-daily-log")]
        public async Task<IActionResult> SaveDailyLog([FromBody] DailyLogSaveViewModel vm)
        {
            if (vm == null || vm.Meals == null || !vm.Meals.Any())
                return BadRequest("Danh sách món ăn trống");

            var tomorrow = DateTime.Now.AddDays(1);
            var dateString = tomorrow.ToString("yyyy-MM-dd");

            var existingLog = await _dailyLogService.GetByUserIdAndDateAsync(vm.UserId, dateString);

            var newMeals = vm.Meals.Select(m => new MealEaten
            {
                MealId = m.MealId,
                TimeSlot = m.TimeSlot,
                Quantity = m.Quantity,
                Unit = m.Unit
            }).ToList();

            if (existingLog != null)
            {
                existingLog.MealsEaten = newMeals;
                await _dailyLogService.SaveAsync(existingLog);
                return Ok(new { message = "Đã cập nhật thực đơn cho ngày mai" });
            }
            else
            {
                var newLog = new DailyLog
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    UserId = vm.UserId,
                    Date = dateString,
                    MealsEaten = newMeals,
                    DailyReview = new DailyReview()
                };
                await _dailyLogService.SaveAsync(newLog);
                return Ok(new { message = "Đã lưu thực đơn cho ngày mai" });
            }
        }
    }
}
