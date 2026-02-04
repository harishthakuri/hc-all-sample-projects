using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Strategy.GoodExample
{
    public class OverlayNone : IOverlay
    {
        public void Apply()
        {
            System.Console.WriteLine("Not applying an overlay");
        }
    }
}