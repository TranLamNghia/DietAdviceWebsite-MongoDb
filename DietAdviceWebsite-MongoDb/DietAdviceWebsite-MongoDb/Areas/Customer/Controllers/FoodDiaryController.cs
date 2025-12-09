using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class FoodDiaryController : Controller
    {
        [HttpGet]
        [Route("customer/food-diary/index")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
