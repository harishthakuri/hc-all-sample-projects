using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Interpreter
{
    public class AdditionExpression : IExpression
    {
        private IExpression _left;
        private IExpression _right;

        public AdditionExpression(IExpression left, IExpression right)
        {
            _left = left;
            _right = right;
        }

        public int Interpret(Context context)
        {
            return _left.Interpret(context) + _right.Interpret(context);
        }
    }
}