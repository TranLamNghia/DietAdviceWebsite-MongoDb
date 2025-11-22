using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class MealPlanController : Controller
    {
        [HttpGet]
        [Route("customer/meal-plan/index")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
