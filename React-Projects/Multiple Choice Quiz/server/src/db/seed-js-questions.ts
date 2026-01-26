import { db, quizzes, questions, options, closeDb } from './index';
import { eq } from 'drizzle-orm';

/**
 * Add 45 more JavaScript questions to test Question Navigator
 */
async function seedJsQuestions() {
  console.log('Adding more JavaScript questions...');

  try {
    // Find the JavaScript Fundamentals quiz
    const jsQuiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.title, 'JavaScript Fundamentals'),
    });

    if (!jsQuiz) {
      console.error('JavaScript Fundamentals quiz not found!');
      return;
    }

    console.log(`Found quiz: ${jsQuiz.title} (ID: ${jsQuiz.id})`);

    // Get current question count
    const existingQuestions = await db.query.questions.findMany({
      where: eq(questions.quizId, jsQuiz.id),
    });
    
    const startOrder = existingQuestions.length + 1;
    console.log(`Existing questions: ${existingQuestions.length}, starting at order: ${startOrder}`);

    // 45 additional JavaScript questions
    const additionalQuestions = [
      {
        text: 'What is hoisting in JavaScript?',
        type: 'single' as const,
        explanation: 'Hoisting is JavaScript\'s behavior of moving declarations to the top of their scope.',
        options: [
          { text: 'Moving declarations to the top of their scope', isCorrect: true },
          { text: 'Lifting DOM elements', isCorrect: false },
          { text: 'A CSS animation technique', isCorrect: false },
          { text: 'A debugging method', isCorrect: false },
        ],
      },
      {
        text: 'Which method adds an element to the end of an array?',
        type: 'single' as const,
        explanation: 'push() adds one or more elements to the end of an array.',
        options: [
          { text: 'pop()', isCorrect: false },
          { text: 'push()', isCorrect: true },
          { text: 'shift()', isCorrect: false },
          { text: 'unshift()', isCorrect: false },
        ],
      },
      {
        text: 'What is the output of: console.log(2 + "2")?',
        type: 'single' as const,
        explanation: 'When adding a number and string, JavaScript converts the number to a string.',
        options: [
          { text: '4', isCorrect: false },
          { text: '"22"', isCorrect: true },
          { text: 'NaN', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
      },
      {
        text: 'Which array methods do NOT mutate the original array? (Select all)',
        type: 'multiple' as const,
        explanation: 'map(), filter(), and slice() return new arrays without modifying the original.',
        options: [
          { text: 'map()', isCorrect: true },
          { text: 'filter()', isCorrect: true },
          { text: 'splice()', isCorrect: false },
          { text: 'slice()', isCorrect: true },
        ],
      },
      {
        text: 'What does "use strict" do?',
        type: 'single' as const,
        explanation: 'Strict mode enables stricter parsing and error handling in JavaScript.',
        options: [
          { text: 'Makes code run faster', isCorrect: false },
          { text: 'Enables stricter parsing and error handling', isCorrect: true },
          { text: 'Disables all errors', isCorrect: false },
          { text: 'Is required for ES6', isCorrect: false },
        ],
      },
      {
        text: 'What is the difference between null and undefined?',
        type: 'single' as const,
        explanation: 'undefined means a variable has been declared but not assigned; null is an intentional absence of value.',
        options: [
          { text: 'They are exactly the same', isCorrect: false },
          { text: 'null is assigned, undefined is not', isCorrect: true },
          { text: 'undefined is assigned, null is not', isCorrect: false },
          { text: 'null is for numbers, undefined is for strings', isCorrect: false },
        ],
      },
      {
        text: 'Which keyword creates a block-scoped variable?',
        type: 'single' as const,
        explanation: 'let and const create block-scoped variables, while var is function-scoped.',
        options: [
          { text: 'var', isCorrect: false },
          { text: 'let', isCorrect: true },
          { text: 'function', isCorrect: false },
          { text: 'define', isCorrect: false },
        ],
      },
      {
        text: 'What is event bubbling?',
        type: 'single' as const,
        explanation: 'Event bubbling is when an event propagates from the target element up through its ancestors.',
        options: [
          { text: 'Events going from parent to child', isCorrect: false },
          { text: 'Events going from child to parent', isCorrect: true },
          { text: 'Events being canceled', isCorrect: false },
          { text: 'Multiple events firing at once', isCorrect: false },
        ],
      },
      {
        text: 'Which are falsy values in JavaScript? (Select all)',
        type: 'multiple' as const,
        explanation: 'false, 0, "", null, undefined, and NaN are all falsy values.',
        options: [
          { text: 'false', isCorrect: true },
          { text: '0', isCorrect: true },
          { text: '""', isCorrect: true },
          { text: '[]', isCorrect: false },
        ],
      },
      {
        text: 'What is the purpose of the bind() method?',
        type: 'single' as const,
        explanation: 'bind() creates a new function with a fixed this value.',
        options: [
          { text: 'To merge two arrays', isCorrect: false },
          { text: 'To create a function with a fixed this value', isCorrect: true },
          { text: 'To bind event listeners', isCorrect: false },
          { text: 'To connect to a database', isCorrect: false },
        ],
      },
      {
        text: 'What does the spread operator (...) do?',
        type: 'single' as const,
        explanation: 'The spread operator expands an iterable into individual elements.',
        options: [
          { text: 'Creates a new variable', isCorrect: false },
          { text: 'Expands an iterable into individual elements', isCorrect: true },
          { text: 'Declares a rest parameter', isCorrect: false },
          { text: 'Concatenates strings', isCorrect: false },
        ],
      },
      {
        text: 'Which methods can be used to iterate over an array? (Select all)',
        type: 'multiple' as const,
        explanation: 'forEach, map, filter, and for...of can all iterate over arrays.',
        options: [
          { text: 'forEach()', isCorrect: true },
          { text: 'map()', isCorrect: true },
          { text: 'for...of', isCorrect: true },
          { text: 'for...in (recommended)', isCorrect: false },
        ],
      },
      {
        text: 'What is a Promise in JavaScript?',
        type: 'single' as const,
        explanation: 'A Promise represents a value that may be available now, later, or never.',
        options: [
          { text: 'A guarantee that code will work', isCorrect: false },
          { text: 'An object representing eventual completion of an async operation', isCorrect: true },
          { text: 'A type of callback', isCorrect: false },
          { text: 'A way to define classes', isCorrect: false },
        ],
      },
      {
        text: 'What are the three states of a Promise?',
        type: 'multiple' as const,
        explanation: 'Promises can be pending, fulfilled, or rejected.',
        options: [
          { text: 'pending', isCorrect: true },
          { text: 'fulfilled', isCorrect: true },
          { text: 'rejected', isCorrect: true },
          { text: 'cancelled', isCorrect: false },
        ],
      },
      {
        text: 'What is the output of: console.log([] == false)?',
        type: 'single' as const,
        explanation: 'An empty array is coerced to an empty string, which equals false.',
        options: [
          { text: 'true', isCorrect: true },
          { text: 'false', isCorrect: false },
          { text: 'undefined', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
      },
      {
        text: 'What does Object.freeze() do?',
        type: 'single' as const,
        explanation: 'Object.freeze() prevents modifications to an object\'s properties.',
        options: [
          { text: 'Deletes an object', isCorrect: false },
          { text: 'Prevents modifications to an object', isCorrect: true },
          { text: 'Converts object to JSON', isCorrect: false },
          { text: 'Creates a copy of an object', isCorrect: false },
        ],
      },
      {
        text: 'Which loop is best for iterating over object properties?',
        type: 'single' as const,
        explanation: 'for...in is designed for iterating over enumerable properties of an object.',
        options: [
          { text: 'for', isCorrect: false },
          { text: 'while', isCorrect: false },
          { text: 'for...in', isCorrect: true },
          { text: 'for...of', isCorrect: false },
        ],
      },
      {
        text: 'What is destructuring in JavaScript?',
        type: 'single' as const,
        explanation: 'Destructuring allows extracting values from arrays or objects into distinct variables.',
        options: [
          { text: 'Deleting properties', isCorrect: false },
          { text: 'Extracting values into variables', isCorrect: true },
          { text: 'Breaking code into modules', isCorrect: false },
          { text: 'Error handling', isCorrect: false },
        ],
      },
      {
        text: 'Which are valid ways to create an object? (Select all)',
        type: 'multiple' as const,
        explanation: 'Objects can be created using literals, constructors, Object.create(), or classes.',
        options: [
          { text: '{}', isCorrect: true },
          { text: 'new Object()', isCorrect: true },
          { text: 'Object.create()', isCorrect: true },
          { text: 'Object.new()', isCorrect: false },
        ],
      },
      {
        text: 'What is the purpose of async/await?',
        type: 'single' as const,
        explanation: 'async/await provides a cleaner syntax for working with Promises.',
        options: [
          { text: 'To make code run faster', isCorrect: false },
          { text: 'To write asynchronous code that looks synchronous', isCorrect: true },
          { text: 'To create multiple threads', isCorrect: false },
          { text: 'To handle errors', isCorrect: false },
        ],
      },
      {
        text: 'What does the "this" keyword refer to?',
        type: 'single' as const,
        explanation: 'this refers to the object that is executing the current function.',
        options: [
          { text: 'The global object always', isCorrect: false },
          { text: 'The object executing the current function', isCorrect: true },
          { text: 'The parent function', isCorrect: false },
          { text: 'The DOM document', isCorrect: false },
        ],
      },
      {
        text: 'What is the output of: typeof NaN?',
        type: 'single' as const,
        explanation: 'Despite meaning "Not a Number", NaN is of type number.',
        options: [
          { text: '"nan"', isCorrect: false },
          { text: '"undefined"', isCorrect: false },
          { text: '"number"', isCorrect: true },
          { text: '"NaN"', isCorrect: false },
        ],
      },
      {
        text: 'Which method converts a JSON string to an object?',
        type: 'single' as const,
        explanation: 'JSON.parse() converts a JSON string into a JavaScript object.',
        options: [
          { text: 'JSON.stringify()', isCorrect: false },
          { text: 'JSON.parse()', isCorrect: true },
          { text: 'JSON.convert()', isCorrect: false },
          { text: 'JSON.toObject()', isCorrect: false },
        ],
      },
      {
        text: 'What are template literals?',
        type: 'single' as const,
        explanation: 'Template literals use backticks and allow embedded expressions with ${}.',
        options: [
          { text: 'Strings with single quotes', isCorrect: false },
          { text: 'Strings with backticks that allow embedded expressions', isCorrect: true },
          { text: 'HTML templates', isCorrect: false },
          { text: 'Function templates', isCorrect: false },
        ],
      },
      {
        text: 'Which statements about arrow functions are true? (Select all)',
        type: 'multiple' as const,
        explanation: 'Arrow functions have a shorter syntax and don\'t have their own this binding.',
        options: [
          { text: 'They have shorter syntax', isCorrect: true },
          { text: 'They don\'t have their own this', isCorrect: true },
          { text: 'They can be used as constructors', isCorrect: false },
          { text: 'They don\'t have arguments object', isCorrect: true },
        ],
      },
      {
        text: 'What is the output of: [1, 2, 3].map(x => x * 2)?',
        type: 'single' as const,
        explanation: 'map() creates a new array with each element multiplied by 2.',
        options: [
          { text: '[1, 2, 3]', isCorrect: false },
          { text: '[2, 4, 6]', isCorrect: true },
          { text: '12', isCorrect: false },
          { text: '[1, 4, 9]', isCorrect: false },
        ],
      },
      {
        text: 'What does the reduce() method do?',
        type: 'single' as const,
        explanation: 'reduce() executes a reducer function on each element, returning a single value.',
        options: [
          { text: 'Removes elements from an array', isCorrect: false },
          { text: 'Reduces array to a single value', isCorrect: true },
          { text: 'Decreases array length', isCorrect: false },
          { text: 'Filters array elements', isCorrect: false },
        ],
      },
      {
        text: 'What is the DOM?',
        type: 'single' as const,
        explanation: 'The DOM (Document Object Model) is a programming interface for HTML documents.',
        options: [
          { text: 'A JavaScript framework', isCorrect: false },
          { text: 'A programming interface for HTML documents', isCorrect: true },
          { text: 'A database', isCorrect: false },
          { text: 'A CSS property', isCorrect: false },
        ],
      },
      {
        text: 'Which methods select DOM elements? (Select all)',
        type: 'multiple' as const,
        explanation: 'getElementById, querySelector, and querySelectorAll are all valid selectors.',
        options: [
          { text: 'getElementById()', isCorrect: true },
          { text: 'querySelector()', isCorrect: true },
          { text: 'querySelectorAll()', isCorrect: true },
          { text: 'selectElement()', isCorrect: false },
        ],
      },
      {
        text: 'What is event delegation?',
        type: 'single' as const,
        explanation: 'Event delegation uses a single handler on a parent for multiple children.',
        options: [
          { text: 'Assigning events to delegates', isCorrect: false },
          { text: 'Using a parent handler for child elements', isCorrect: true },
          { text: 'Removing event listeners', isCorrect: false },
          { text: 'Creating custom events', isCorrect: false },
        ],
      },
      {
        text: 'What is the output of: "5" - 3?',
        type: 'single' as const,
        explanation: 'The - operator converts the string "5" to a number, resulting in 2.',
        options: [
          { text: '"53"', isCorrect: false },
          { text: '2', isCorrect: true },
          { text: 'NaN', isCorrect: false },
          { text: '"2"', isCorrect: false },
        ],
      },
      {
        text: 'What does Array.isArray() do?',
        type: 'single' as const,
        explanation: 'Array.isArray() checks if a value is an array.',
        options: [
          { text: 'Creates an array', isCorrect: false },
          { text: 'Checks if a value is an array', isCorrect: true },
          { text: 'Converts to array', isCorrect: false },
          { text: 'Sorts an array', isCorrect: false },
        ],
      },
      {
        text: 'What is the difference between == and ===?',
        type: 'single' as const,
        explanation: '== performs type coercion, === compares without coercion.',
        options: [
          { text: 'No difference', isCorrect: false },
          { text: '=== is stricter, no type coercion', isCorrect: true },
          { text: '== is stricter', isCorrect: false },
          { text: '=== is only for strings', isCorrect: false },
        ],
      },
      {
        text: 'Which are valid string methods? (Select all)',
        type: 'multiple' as const,
        explanation: 'split(), slice(), and trim() are all valid string methods.',
        options: [
          { text: 'split()', isCorrect: true },
          { text: 'slice()', isCorrect: true },
          { text: 'trim()', isCorrect: true },
          { text: 'push()', isCorrect: false },
        ],
      },
      {
        text: 'What is a callback function?',
        type: 'single' as const,
        explanation: 'A callback is a function passed as an argument to another function.',
        options: [
          { text: 'A function that returns another function', isCorrect: false },
          { text: 'A function passed as an argument', isCorrect: true },
          { text: 'A function that calls itself', isCorrect: false },
          { text: 'A built-in function', isCorrect: false },
        ],
      },
      {
        text: 'What is the output of: Boolean("false")?',
        type: 'single' as const,
        explanation: 'Any non-empty string, including "false", is truthy.',
        options: [
          { text: 'false', isCorrect: false },
          { text: 'true', isCorrect: true },
          { text: 'undefined', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
      },
      {
        text: 'What does the finally block do in try-catch?',
        type: 'single' as const,
        explanation: 'The finally block executes regardless of whether an exception occurred.',
        options: [
          { text: 'Only runs if there\'s an error', isCorrect: false },
          { text: 'Always runs after try/catch', isCorrect: true },
          { text: 'Prevents errors', isCorrect: false },
          { text: 'Closes the program', isCorrect: false },
        ],
      },
      {
        text: 'Which are ways to define a class in JavaScript? (Select all)',
        type: 'multiple' as const,
        explanation: 'ES6 class syntax, constructor functions, and Object.create() can all create classes.',
        options: [
          { text: 'class keyword (ES6)', isCorrect: true },
          { text: 'Constructor functions', isCorrect: true },
          { text: 'Object.create()', isCorrect: true },
          { text: 'new Class()', isCorrect: false },
        ],
      },
      {
        text: 'What is the prototype chain?',
        type: 'single' as const,
        explanation: 'The prototype chain is how JavaScript objects inherit properties from other objects.',
        options: [
          { text: 'A linked list data structure', isCorrect: false },
          { text: 'How objects inherit properties', isCorrect: true },
          { text: 'A design pattern', isCorrect: false },
          { text: 'A type of loop', isCorrect: false },
        ],
      },
      {
        text: 'What does setTimeout() return?',
        type: 'single' as const,
        explanation: 'setTimeout() returns a timeout ID that can be used with clearTimeout().',
        options: [
          { text: 'undefined', isCorrect: false },
          { text: 'A timeout ID (number)', isCorrect: true },
          { text: 'A Promise', isCorrect: false },
          { text: 'The callback result', isCorrect: false },
        ],
      },
      {
        text: 'What is localStorage?',
        type: 'single' as const,
        explanation: 'localStorage stores key-value pairs that persist across browser sessions.',
        options: [
          { text: 'Server-side storage', isCorrect: false },
          { text: 'Persistent browser storage', isCorrect: true },
          { text: 'Temporary memory', isCorrect: false },
          { text: 'A JavaScript variable', isCorrect: false },
        ],
      },
      {
        text: 'Which are valid ways to clone an object? (Select all)',
        type: 'multiple' as const,
        explanation: 'Spread operator, Object.assign(), and JSON methods can clone objects.',
        options: [
          { text: '{ ...obj }', isCorrect: true },
          { text: 'Object.assign({}, obj)', isCorrect: true },
          { text: 'JSON.parse(JSON.stringify(obj))', isCorrect: true },
          { text: 'obj.clone()', isCorrect: false },
        ],
      },
      {
        text: 'What is the output of: typeof function(){}?',
        type: 'single' as const,
        explanation: 'typeof returns "function" for function declarations and expressions.',
        options: [
          { text: '"object"', isCorrect: false },
          { text: '"function"', isCorrect: true },
          { text: '"undefined"', isCorrect: false },
          { text: '"method"', isCorrect: false },
        ],
      },
      {
        text: 'What does the new keyword do?',
        type: 'single' as const,
        explanation: 'new creates an instance of an object from a constructor function.',
        options: [
          { text: 'Creates a new variable', isCorrect: false },
          { text: 'Creates an object instance', isCorrect: true },
          { text: 'Defines a new function', isCorrect: false },
          { text: 'Allocates memory', isCorrect: false },
        ],
      },
    ];

    // Insert questions and options
    for (let i = 0; i < additionalQuestions.length; i++) {
      const q = additionalQuestions[i];
      const order = startOrder + i;

      const [question] = await db
        .insert(questions)
        .values({
          quizId: jsQuiz.id,
          text: q.text,
          type: q.type,
          explanation: q.explanation,
          order: order,
        })
        .returning();

      await db.insert(options).values(
        q.options.map((opt, index) => ({
          questionId: question.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: index + 1,
        }))
      );

      if ((i + 1) % 10 === 0) {
        console.log(`Inserted ${i + 1}/${additionalQuestions.length} questions...`);
      }
    }

    // Update quiz time limit for 50 questions (15 minutes = 900 seconds)
    await db
      .update(quizzes)
      .set({ timeLimit: 1800 }) // 30 minutes for 50 questions
      .where(eq(quizzes.id, jsQuiz.id));

    console.log(`\nSuccessfully added ${additionalQuestions.length} questions!`);
    console.log(`Total questions in JavaScript Fundamentals: ${existingQuestions.length + additionalQuestions.length}`);
    console.log(`Time limit updated to 30 minutes`);
  } catch (error) {
    console.error('Failed to add questions:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

seedJsQuestions();
