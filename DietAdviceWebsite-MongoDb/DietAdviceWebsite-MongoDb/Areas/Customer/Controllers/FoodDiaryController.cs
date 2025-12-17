using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using DietAdviceWebsite_MongoDb.Areas.Customer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using DietAdviceWebsite_MongoDb.Models;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class FoodDiaryController : Controller
    {
        private readonly FoodDiaryService _foodDiaryService;
        private readonly DailyLogService _dailyLogService;

        public FoodDiaryController(FoodDiaryService foodDiaryService, DailyLogService dailyLogService)
        {
            _foodDiaryService = foodDiaryService;
            _dailyLogService = dailyLogService;
        }

        [HttpGet]
        [Route("customer/food-diary/index")]
        public IActionResult Index()
        {
            var userId = User.FindFirstValue("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Account", new { area = "" });
            }

            return View();
        }

        [HttpGet]
        [Route("customer/food-diary/get-diary-data")]
        public async Task<IActionResult> GetDiaryData(DateTime? date)
        {
            var userId = User.FindFirstValue("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var currentDate = date ?? DateTime.Today;
            var viewModel = await _foodDiaryService.GetFoodDiaryViewModelAsync(userId, currentDate);

            return Json(viewModel);
        }

        [HttpPost]
        [Route("customer/food-diary/submit-review")]
        public async Task<IActionResult> SubmitReview([FromBody] DailyReviewViewModel model, DateTime date)
        {
            var userId = User.FindFirstValue("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (model == null || model.Rating <= 0)
            {
                return BadRequest(new { success = false, message = "Dữ liệu đánh giá không hợp lệ." });
            }

            try
            {
                // Gọi DailyLogService để update vào DB
                // Hàm UpdateDailyReviewAsync cần được viết trong DailyLogService
                await _dailyLogService.UpdateDailyReviewAsync(userId, date, model.Rating, model.Comment);

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}