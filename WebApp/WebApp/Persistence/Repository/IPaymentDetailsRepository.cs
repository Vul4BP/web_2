using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebApp.Persistence.Repository
{
    public interface IPaymentDetailsRepository : IRepository<Models.PaymentDetails, string>
    {
    }
}
