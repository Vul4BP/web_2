using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using WebApp.Models;
using WebApp.Persistence;
using WebApp.Persistence.UnitOfWork;

namespace WebApp.Controllers
{
    public class PaymentDetailsController : ApiController
    {
        private IUnitOfWork unitOfWork;

        public PaymentDetailsController(IUnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork;
        }

        // GET: api/PaymentDetails
        public IEnumerable<PaymentDetails> GetPaymentDetails()
        {
            return unitOfWork.PaymentDetails.GetAll();
        }

        // GET: api/PaymentDetails/5
        [ResponseType(typeof(PaymentDetails))]
        public IHttpActionResult GetPaymentDetails(string id)
        {
            PaymentDetails paymentDetails = unitOfWork.PaymentDetails.Get(id);
            if (paymentDetails == null)
            {
                return NotFound();
            }

            return Ok(paymentDetails);
        }

        // PUT: api/PaymentDetails/5
        [ResponseType(typeof(void))]
        [Authorize(Roles = "Admin")]
        public IHttpActionResult PutPaymentDetails(string id, PaymentDetails paymentDetails)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != paymentDetails.Id)
            {
                return BadRequest();
            }

            try
            {
                unitOfWork.PaymentDetails.Update(paymentDetails);
                unitOfWork.Complete();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentDetailsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/PaymentDetails
        [ResponseType(typeof(PaymentDetails))]
        [Authorize(Roles = "Admin")]
        public IHttpActionResult PostPaymentDetails(PaymentDetails paymentDetails)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            unitOfWork.PaymentDetails.Add(paymentDetails);

            try
            {
                unitOfWork.Complete();
            }
            catch (DbUpdateException)
            {
                if (PaymentDetailsExists(paymentDetails.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = paymentDetails.Id }, paymentDetails);
        }

        // DELETE: api/PaymentDetails/5
        [ResponseType(typeof(PaymentDetails))]
        [Authorize(Roles = "Admin")]
        public IHttpActionResult DeletePaymentDetails(string id)
        {
            PaymentDetails paymentDetails = unitOfWork.PaymentDetails.Get(id);
            if (paymentDetails == null)
            {
                return NotFound();
            }
            unitOfWork.PaymentDetails.Remove(paymentDetails);
            unitOfWork.Complete();

            return Ok(paymentDetails);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                unitOfWork.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PaymentDetailsExists(string id)
        {
            return unitOfWork.PaymentDetails.Find(e => e.Id == id).Count() > 0;
        }
    }
}