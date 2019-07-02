using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApp.Models;

namespace WebApp.Persistence.Repository
{
    public class PaymentDetailsRepository : Repository<PaymentDetails, string>, IPaymentDetailsRepository
    {
        public PaymentDetailsRepository(System.Data.Entity.DbContext context) : base(context) { }
    }
}