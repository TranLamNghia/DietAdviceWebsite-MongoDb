using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels;

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

            // Gán lại profile
            user.Profile = new Profile
            {
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
            try {
                await _userService.SaveUserAsync(user);

                return StatusCode(201, new
                {
                    message = "Đã lưu dữ liệu chế độ ăn thành công!"
                });
            } catch(Exception ex)
            {
                return StatusCode(400, new
                {
                    message = ex,
                });
            }
        }
    }
}
