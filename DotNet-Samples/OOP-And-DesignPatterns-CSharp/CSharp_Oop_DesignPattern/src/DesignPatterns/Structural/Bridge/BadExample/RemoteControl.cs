using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Structural.Bridge.BadExample
{
    // Base remote control class
    public abstract class RemoteControl
    {
        public abstract void TurnOn();

        public abstract void TurnOff();

        public abstract void VolumeUp();

        public abstract void VolumeDown();
    }
}