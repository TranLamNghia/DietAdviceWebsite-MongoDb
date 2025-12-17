using Microsoft.AspNetCore.Mvc;
using DietAdviceWebsite_MongoDb.Areas.Admin.Services;

namespace DietAdviceWebsite_MongoDb.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class AccountController : Controller
    {
        private readonly AccountAdminService _accountService;

        public AccountController(AccountAdminService accountService)
        {
            _accountService = accountService;
        }

        public async Task<IActionResult> Index()
        {
            var accounts = await _accountService.GetAllAsync();

            // Xử lý sắp xếp hiển thị ở đây: Đưa Admin lên đầu danh sách cho dễ quản lý
            // Logic: Nếu là Admin thì xếp trước, sau đó xếp theo ID (mới nhất)
            var sortedList = accounts.OrderByDescending(x => x.Role == "Admin")
                                     .ThenByDescending(x => x.Id)
                                     .ToList();

            return View(sortedList);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateRole(string id, string role)
        {
            // Chỉ cho phép 2 quyền này để bảo mật
            if (role == "Admin" || role == "Customer")
            {
                await _accountService.ChangeRoleAsync(id, role);
                TempData["Success"] = "Đã cập nhật quyền thành công!";
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(string id)
        {
            await _accountService.DeleteAsync(id);
            TempData["Success"] = "Đã xóa tài khoản thành công!";
            return RedirectToAction(nameof(Index));
        }
    }
}