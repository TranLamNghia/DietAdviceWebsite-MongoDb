using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class MealManagementController : Controller
    {
        [HttpGet]
        [Route("customer/meal-management/index")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
