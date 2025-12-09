using Microsoft.AspNetCore.Mvc;

namespace DietAdviceWebsite_MongoDb.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class HomeController : Controller
    {
        [HttpGet]
        [Route("customer/home/index")]
        public IActionResult Index()
        {
            return View();
        }

        
    }
}
