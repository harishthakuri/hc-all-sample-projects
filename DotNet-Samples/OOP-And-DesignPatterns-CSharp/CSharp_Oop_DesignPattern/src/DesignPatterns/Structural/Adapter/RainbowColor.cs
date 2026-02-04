using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSharp_Oop_DesignPatter.src.DesignPatterns.Structural.Adapter.ThirdPartyColorLibrary;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Structural.Adapter
{
    // Adapter class. Rainbow is the adaptee
    public class RainbowColor : Color
    {
        private Rainbow _rainbow; // "composition" -- RainbowColor is composed of, "has a", Rainbow. See RainbowAdapter for inheritance alternative.

        public RainbowColor(Rainbow rainbow)
        {
            _rainbow = rainbow;
        }

        public void Apply(Video video)
        {
            _rainbow.Setup();
            _rainbow.Update(video);
        }
    }
}