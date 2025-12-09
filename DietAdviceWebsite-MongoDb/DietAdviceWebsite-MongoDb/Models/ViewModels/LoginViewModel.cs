using System.ComponentModel.DataAnnotations;

namespace DietAdviceWebsite_MongoDb.Models.ViewModels
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập Email")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Vui lòng nhập Mật khẩu")]
        public string Password { get; set; } = null!;
    }
}
