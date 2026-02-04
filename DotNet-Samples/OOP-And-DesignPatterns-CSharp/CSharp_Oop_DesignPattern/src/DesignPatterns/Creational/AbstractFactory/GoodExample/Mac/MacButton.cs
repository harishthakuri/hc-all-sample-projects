using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.AbstractFactory.GoodExample.Mac
{
    public class MacButton : IButton
    {
        public void Render()
        {
            System.Console.WriteLine("Mac: render button");
        }
    }
}