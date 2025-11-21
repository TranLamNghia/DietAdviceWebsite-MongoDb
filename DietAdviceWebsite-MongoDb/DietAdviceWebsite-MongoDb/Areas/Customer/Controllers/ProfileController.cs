using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class ProfileController : Controller
    {
        [HttpGet]
        [Route("customer/profile/index")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
