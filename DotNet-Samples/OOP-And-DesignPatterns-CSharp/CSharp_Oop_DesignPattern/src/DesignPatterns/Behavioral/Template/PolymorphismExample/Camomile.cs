using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Template.PolymorphismExample
{
    public class Camomile : Beverage
    {
        public void Prepare()
        {
            Brew();
        }

        public void Brew()
        {
            System.Console.WriteLine("Brewing for 3 mins");
        }
    }
}