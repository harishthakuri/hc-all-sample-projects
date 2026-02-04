using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Mediator.GoodExample.UIFramework
{
    public class TextBox : UIControl
    {
        private string _text = "";

        public TextBox(DialogBox owner) : base(owner)
        {
        }

        public string GetText()
        {
            return _text;
        }

        public void SetText(string text)
        {
            _text = text;
            _owner.Changed(this);
        }
    }
}