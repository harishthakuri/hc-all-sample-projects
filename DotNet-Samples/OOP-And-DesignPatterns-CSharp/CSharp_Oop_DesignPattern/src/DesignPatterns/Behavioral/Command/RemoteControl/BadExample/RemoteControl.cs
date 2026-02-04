using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Command.RemoteControl.BadExample
{
    // "Invoker": the remote control
    public class RemoteControl
    {
        private Light _light;

        public RemoteControl(Light light)
        {
            _light = light;
        }

        public void PressButton(bool turnOn)
        {
            if (turnOn)
            {
                _light.TurnOn();
            }
            else
            {
                _light.TurnOff();
            }
        }

        // Adding new functionality requires modifying this class, e.g.:
        // New method for dimming the light
        public void DimLight()
        {
            _light.Dim();
        }
    }

}