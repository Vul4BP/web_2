using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class PaymentDetails
    {
        [Key]
        public string Id { get; set; }
        [Required]
        public string Cart { get; set; }
        public string CreateTime { get; set; }
        public string Intent { get; set; }
        [Required]
        public string State { get; set; }
        public string PayerName { get; set; }
        public string PayerSurname { get; set; }
        [Required]
        public string PayerId { get; set; }
        [EmailAddress]
        public string PayerEmail { get; set; }
        [Required]
        public string AddressCountryCode { get; set; }
        public string AddressCity { get; set; }
        public string AddressLine { get; set; }
        [Required]
        public string AddressPostalCode { get; set; }
        public string ItemName { get; set; }
        [Required]
        public Double ItemPrice { get; set; }
        [Required]
        public string ItemCurrency { get; set; }
        public Double CurrencyRate { get; set; }
        //public Guid SoldTicketId { get; set; }
        //public SoldTicket SoldTicket { get; set; }
    }
}