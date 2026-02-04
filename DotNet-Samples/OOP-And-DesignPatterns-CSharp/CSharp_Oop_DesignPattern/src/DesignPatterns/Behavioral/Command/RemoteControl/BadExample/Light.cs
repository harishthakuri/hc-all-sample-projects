using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Command.RemoteControl.BadExample
{
    // "Receiver": the light
    public class Light
    {
        public void TurnOn()
        {
            System.Console.WriteLine("Light is on");
        }

        public void TurnOff()
        {
            System.Console.WriteLine("Light is off");
        }

        public void Dim()
        {
            System.Console.WriteLine("Light is dim");
        }
    }
}