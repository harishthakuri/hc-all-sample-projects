using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.Polymorphism
{
    public class Vehicle
    {
        public string Brand { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }

        public virtual void Start()
        {
            Console.WriteLine("Vehicle is starting.");
        }

        public virtual void Stop()
        {
            Console.WriteLine("Vehicle is stopping.");
        }
    }
}