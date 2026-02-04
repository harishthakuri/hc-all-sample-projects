using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Structural.Bridge.BadExample
{
    public abstract class AdvancedRemote : RemoteControl
    {
        public abstract void SetChannel(int channel);
    }
}