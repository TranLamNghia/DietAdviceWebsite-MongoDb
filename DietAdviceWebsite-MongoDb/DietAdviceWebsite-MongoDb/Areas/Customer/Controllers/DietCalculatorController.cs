using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Areas.ViewModel;
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
        public DietCalculatorController(UserService userService)
        {
            _userService = userService;
        }
        [HttpGet]
        [Route("customer/diet-calculator/index")]
        public IActionResult Index()
        {
            return View();
        }
        // POST: Lưu dữ liệu tính toán vào MongoDB
        [HttpPost]
        [Route("customer/diet-calculator/save")]
        public async Task<IActionResult> SaveDietData([FromBody] DietSaveViewModel vm)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dữ liệu không hợp lệ.");

            // Lấy user trong DB (nếu chưa có → tạo mới)
            var user = await _userService.GetUserByIdAsync(vm.UserId);

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
                Gender = vm.Gender,
                BirthYear = DateTime.UtcNow.Year - vm.Age,
                ActivityLevel = vm.ActivityLevel,
                DietPreference = "normal",
                HealthCondition = "none",
                Allergies = new List<string>()
            };

            // Gán mục tiêu
            user.CurrentGoal = new CurrentGoal
            {
                GoalType = vm.GoalType,
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
