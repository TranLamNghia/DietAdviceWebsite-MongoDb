using DietAdviceWebsite_MongoDb.Areas.Customer.Services;
using DietAdviceWebsite_MongoDb.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Route("customer/profile")]
    public class ProfileController : Controller
    {
        private readonly UserService _userService;

        public ProfileController(UserService userService)
        {
            _userService = userService;
        }

        private string? GetUserEmail()
        {
            return User.FindFirstValue(ClaimTypes.Email)
                   ?? User.Identity?.Name;
        }

        // -------------------------------------------------------
        // PROFILE INDEX
        // -------------------------------------------------------
        [HttpGet("index")]
        public async Task<IActionResult> Index()
        {
            if (!User.Identity.IsAuthenticated)
                return RedirectToAction("Login", "Account");

            string? email = GetUserEmail();
            if (email == null)
                return RedirectToAction("Login", "Account");

            var user = await _userService.GetUserByEmailAsync(email);

            // Nếu chưa có thì tạo user mặc định
            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    CreatedAt = DateTime.UtcNow,
                    Profile = new Profile()
                };

                await _userService.SaveUserAsync(user);
            }

            return View(user);
        }

        // -------------------------------------------------------
        // EDIT GET
        // -------------------------------------------------------
        [HttpGet("edit")]
        public async Task<IActionResult> Edit()
        {
            string? email = GetUserEmail();
            if (email == null)
                return RedirectToAction("Login", "Account");

            var user = await _userService.GetUserByEmailAsync(email);
            if (user == null)
                return RedirectToAction("Index");

            return View(user);
        }

        // -------------------------------------------------------
        // EDIT POST
        // -------------------------------------------------------
        [HttpPost("edit")]
        public async Task<IActionResult> Edit(
            string FullName, int Weight, int Height, int BirthYear,
            string Gender, string Allergies, string HealthCondition,
            string ActivityLevel, IFormFile? avatar)
        {
            string? email = GetUserEmail();
            if (email == null)
                return RedirectToAction("Login", "Account");

            var user = await _userService.GetUserByEmailAsync(email);
            if (user == null)
                return RedirectToAction("Index");

            var profile = user.Profile ?? new Profile();

            profile.FullName = FullName;
            profile.Weight = Weight;
            profile.Height = Height;
            profile.BirthYear = BirthYear;
            profile.Gender = Gender;
            profile.ActivityLevel = ActivityLevel;
            profile.HealthCondition = HealthCondition;
            profile.Allergies = Allergies?.Split(',').Select(a => a.Trim()).ToList();

            // Upload avatar nếu có file
            if (avatar != null)
            {
                using var ms = new MemoryStream();
                await avatar.CopyToAsync(ms);
                var bytes = ms.ToArray();

                
            }

            user.Profile = profile;
            await _userService.UpdateUser(user);

            return RedirectToAction("Index");
        }
    }
}
