using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using DietAdviceWebsite_MongoDb.Models;
using DietAdviceWebsite_MongoDb.Service;
using DietAdviceWebsite_MongoDb.Models.ViewModels;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace DietAdviceWebsite_MongoDb.Controllers
{
    public class AccountController : Controller
    {
        private readonly AuthService _authService;
        public AccountController(AuthService authService)
        {
            _authService = authService;
        }
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel registerViewModel)
        {
            if (!ModelState.IsValid == true)
            {
                return View(registerViewModel);
            }

            var result = await _authService.RegisterAsync(registerViewModel.Email, registerViewModel.Password, registerViewModel.FullName);
            if (result == "Success")
            {
                TempData["SuccessMessage"] = "Đăng ký thành công! Hãy đăng nhập.";
                return RedirectToAction("Login");
            }

            ViewBag.Error = result;

            return View(registerViewModel);
        }
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel loginViewModel)
        {
            if (!ModelState.IsValid) return View(loginViewModel);
            var account = await _authService.ValidateLoginAsync(loginViewModel.Email, loginViewModel.Password);
            if (account == null)
            {
                ViewBag.Error = "Sai Email hoặc Mật khẩu";
                return View(loginViewModel);
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, account.Email),
                new Claim(ClaimTypes.Role, account.Role),
                new Claim("UserId", account.Id)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

            if (account.Role == "Admin")
                return RedirectToAction("Index", "Admin");
            else
                return RedirectToAction("Index", "Home", new { area = "Customer" });
        }
        
        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login", "Account");
        }
    }
}
