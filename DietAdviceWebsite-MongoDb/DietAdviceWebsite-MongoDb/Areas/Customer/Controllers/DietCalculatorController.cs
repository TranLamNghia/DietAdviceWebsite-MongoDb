using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class DietCalculatorController : Controller
    {
        [HttpGet]
        [Route("customer/diet-calculator/index")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
