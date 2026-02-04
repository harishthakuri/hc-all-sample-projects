using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Command.UndoableCommandPattern
{
    // UndoableCommand extends Command, so every UndoableCommand object is a Command object.
    public interface UndoableCommand : Command
    {
        void Unexecute();
    }
}