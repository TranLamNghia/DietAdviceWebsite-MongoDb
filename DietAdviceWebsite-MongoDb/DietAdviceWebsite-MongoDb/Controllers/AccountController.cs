using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace DietAdviceWebsite_MongoDb.Controllers
{
    public class AccountController : Controller
    {
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Login(string username, string password)
        {
            if (username == "admin" && password == "123") // kiểm tra demo
            {
                // Lưu tên người dùng vào session
                HttpContext.Session.SetString("Username", username);

                return RedirectToAction("Index", "Home");
            }

            ViewBag.Error = "Tên đăng nhập hoặc mật khẩu không đúng!";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear(); // Xóa session khi đăng xuất
            return RedirectToAction("Index", "Home");
        }


        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(string username, string email, string password, string confirmPassword)
        {
            if (password != confirmPassword)
            {
                ViewBag.Error = "Mật khẩu xác nhận không khớp!";
                return View();
            }

            //  Lưu thông tin tài khoản vào MongoDB
            ViewBag.Message = "Đăng ký tài khoản thành công!";
            return RedirectToAction("Login");
        }

    }
}
