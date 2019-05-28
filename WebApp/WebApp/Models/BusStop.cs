﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class BusStop
    {
        [Key]
        public Guid Id { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public ICollection<BusStop> BusStops { get; set; }


    }
}