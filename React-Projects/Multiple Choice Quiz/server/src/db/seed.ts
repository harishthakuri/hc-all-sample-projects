import { db, quizzes, questions, options, categories, closeDb } from './index';
import { createAdminUser } from '../services/authService';

/**
 * Seed the database with sample data
 */
async function seed() {
  console.log('Seeding database...');

  try {
    // Create admin user
    console.log('Creating admin user...');
    await createAdminUser('admin@mcqquiz.com', 'admin123', 'Admin User');

    // Create categories
    console.log('Creating categories...');
    const [webDev] = await db
      .insert(categories)
      .values({
        name: 'Web Development',
        slug: 'web-development',
        description: 'Frontend, backend, and full-stack web development topics',
        icon: 'Globe',
        color: 'blue',
        order: 1,
      })
      .onConflictDoNothing()
      .returning();

    const [programming] = await db
      .insert(categories)
      .values({
        name: 'Programming',
        slug: 'programming',
        description: 'General programming concepts and languages',
        icon: 'Code',
        color: 'green',
        order: 2,
      })
      .onConflictDoNothing()
      .returning();

    const [database] = await db
      .insert(categories)
      .values({
        name: 'Databases',
        slug: 'databases',
        description: 'SQL, NoSQL, and database design',
        icon: 'Database',
        color: 'purple',
        order: 3,
      })
      .onConflictDoNothing()
      .returning();

    const [devops] = await db
      .insert(categories)
      .values({
        name: 'DevOps',
        slug: 'devops',
        description: 'CI/CD, containers, and cloud services',
        icon: 'Cloud',
        color: 'orange',
        order: 4,
      })
      .onConflictDoNothing()
      .returning();

    // Create sample quizzes
    console.log('Creating quizzes...');

    // JavaScript Quiz
    const [jsQuiz] = await db
      .insert(quizzes)
      .values({
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript basics including variables, functions, and ES6 features.',
        categoryId: webDev?.id || null,
        difficulty: 'medium',
        timeLimit: 420,
        passingScore: 60,
        isActive: true,
        isFeatured: true,
      })
      .returning();

    // React Quiz
    const [reactQuiz] = await db
      .insert(quizzes)
      .values({
        title: 'React Essentials',
        description: 'Assess your understanding of React concepts including hooks, components, and state management.',
        categoryId: webDev?.id || null,
        difficulty: 'medium',
        timeLimit: 420,
        passingScore: 60,
        isActive: true,
        isFeatured: true,
      })
      .returning();

    // Python Quiz
    const [pythonQuiz] = await db
      .insert(quizzes)
      .values({
        title: 'Python Basics',
        description: 'Test your Python programming knowledge from basics to intermediate concepts.',
        categoryId: programming?.id || null,
        difficulty: 'easy',
        timeLimit: 420,
        passingScore: 60,
        isActive: true,
        isFeatured: false,
      })
      .returning();

    // SQL Quiz
    const [sqlQuiz] = await db
      .insert(quizzes)
      .values({
        title: 'SQL Fundamentals',
        description: 'Test your knowledge of SQL queries, joins, and database concepts.',
        categoryId: database?.id || null,
        difficulty: 'medium',
        timeLimit: 420,
        passingScore: 60,
        isActive: true,
        isFeatured: false,
      })
      .returning();

    // JavaScript Quiz Questions
    const jsQuestions = [
      {
        quizId: jsQuiz.id,
        text: 'What is the output of: console.log(typeof null)?',
        type: 'single' as const,
        explanation: 'This is a well-known JavaScript quirk. typeof null returns "object" due to a bug in the original JavaScript implementation.',
        order: 1,
        options: [
          { text: '"null"', isCorrect: false },
          { text: '"undefined"', isCorrect: false },
          { text: '"object"', isCorrect: true },
          { text: '"number"', isCorrect: false },
        ],
      },
      {
        quizId: jsQuiz.id,
        text: 'Which of the following are valid ways to declare a variable in JavaScript? (Select all that apply)',
        type: 'multiple' as const,
        explanation: 'var, let, and const are all valid variable declaration keywords in JavaScript.',
        order: 2,
        options: [
          { text: 'var', isCorrect: true },
          { text: 'let', isCorrect: true },
          { text: 'const', isCorrect: true },
          { text: 'variable', isCorrect: false },
        ],
      },
      {
        quizId: jsQuiz.id,
        text: 'What does the "===" operator do in JavaScript?',
        type: 'single' as const,
        explanation: 'The === operator performs strict equality comparison without type coercion.',
        order: 3,
        options: [
          { text: 'Assigns a value', isCorrect: false },
          { text: 'Compares values with type coercion', isCorrect: false },
          { text: 'Compares values without type coercion', isCorrect: true },
          { text: 'Compares memory addresses', isCorrect: false },
        ],
      },
      {
        quizId: jsQuiz.id,
        text: 'Which ES6 features are used for handling asynchronous operations? (Select all that apply)',
        type: 'multiple' as const,
        explanation: 'Promises and async/await are ES6+ features for handling asynchronous operations.',
        order: 4,
        options: [
          { text: 'Promises', isCorrect: true },
          { text: 'async/await', isCorrect: true },
          { text: 'Callbacks', isCorrect: false },
          { text: 'Arrow functions', isCorrect: false },
        ],
      },
      {
        quizId: jsQuiz.id,
        text: 'What is a closure in JavaScript?',
        type: 'single' as const,
        explanation: 'A closure is a function that has access to variables from its outer scope.',
        order: 5,
        options: [
          { text: 'A way to close the browser window', isCorrect: false },
          { text: 'A function with access to its outer scope variables', isCorrect: true },
          { text: 'A method to end a loop', isCorrect: false },
          { text: 'A type of error handling', isCorrect: false },
        ],
      },
    ];

    // React Quiz Questions
    const reactQuestions = [
      {
        quizId: reactQuiz.id,
        text: 'What hook is used to manage state in a functional component?',
        type: 'single' as const,
        explanation: 'useState is the primary hook for managing local state in functional components.',
        order: 1,
        options: [
          { text: 'useEffect', isCorrect: false },
          { text: 'useState', isCorrect: true },
          { text: 'useContext', isCorrect: false },
          { text: 'useReducer', isCorrect: false },
        ],
      },
      {
        quizId: reactQuiz.id,
        text: 'Which hooks are used for side effects in React? (Select all that apply)',
        type: 'multiple' as const,
        explanation: 'useEffect and useLayoutEffect are both used for side effects.',
        order: 2,
        options: [
          { text: 'useEffect', isCorrect: true },
          { text: 'useLayoutEffect', isCorrect: true },
          { text: 'useState', isCorrect: false },
          { text: 'useMemo', isCorrect: false },
        ],
      },
      {
        quizId: reactQuiz.id,
        text: 'What is the virtual DOM?',
        type: 'single' as const,
        explanation: 'The virtual DOM is a lightweight JavaScript representation of the actual DOM.',
        order: 3,
        options: [
          { text: 'A browser API', isCorrect: false },
          { text: 'A JavaScript representation of the real DOM', isCorrect: true },
          { text: 'A database for React', isCorrect: false },
          { text: 'A styling framework', isCorrect: false },
        ],
      },
      {
        quizId: reactQuiz.id,
        text: 'Which are valid ways to pass data between components? (Select all that apply)',
        type: 'multiple' as const,
        explanation: 'Props, Context API, and state management libraries are valid ways to share data.',
        order: 4,
        options: [
          { text: 'Props', isCorrect: true },
          { text: 'Context API', isCorrect: true },
          { text: 'Global variables', isCorrect: false },
          { text: 'Redux/Zustand', isCorrect: true },
        ],
      },
      {
        quizId: reactQuiz.id,
        text: 'What is the purpose of the key prop in React lists?',
        type: 'single' as const,
        explanation: 'Keys help React identify which items have changed for efficient re-rendering.',
        order: 5,
        options: [
          { text: 'Styling list items', isCorrect: false },
          { text: 'Sorting list items', isCorrect: false },
          { text: 'Helping React identify changed items', isCorrect: true },
          { text: 'Adding event listeners', isCorrect: false },
        ],
      },
    ];

    // Python Quiz Questions
    const pythonQuestions = [
      {
        quizId: pythonQuiz.id,
        text: 'What is the output of: print(type([]))',
        type: 'single' as const,
        explanation: 'An empty [] creates a list in Python.',
        order: 1,
        options: [
          { text: '<class \'list\'>', isCorrect: true },
          { text: '<class \'array\'>', isCorrect: false },
          { text: '<class \'tuple\'>', isCorrect: false },
          { text: '<class \'set\'>', isCorrect: false },
        ],
      },
      {
        quizId: pythonQuiz.id,
        text: 'Which of these are mutable data types in Python? (Select all that apply)',
        type: 'multiple' as const,
        explanation: 'Lists, dictionaries, and sets are mutable. Tuples and strings are immutable.',
        order: 2,
        options: [
          { text: 'List', isCorrect: true },
          { text: 'Tuple', isCorrect: false },
          { text: 'Dictionary', isCorrect: true },
          { text: 'Set', isCorrect: true },
        ],
      },
      {
        quizId: pythonQuiz.id,
        text: 'What keyword is used to define a function in Python?',
        type: 'single' as const,
        explanation: 'The def keyword is used to define functions in Python.',
        order: 3,
        options: [
          { text: 'function', isCorrect: false },
          { text: 'def', isCorrect: true },
          { text: 'func', isCorrect: false },
          { text: 'define', isCorrect: false },
        ],
      },
    ];

    // SQL Quiz Questions
    const sqlQuestions = [
      {
        quizId: sqlQuiz.id,
        text: 'Which SQL statement is used to retrieve data from a database?',
        type: 'single' as const,
        explanation: 'SELECT is used to query and retrieve data from database tables.',
        order: 1,
        options: [
          { text: 'GET', isCorrect: false },
          { text: 'SELECT', isCorrect: true },
          { text: 'RETRIEVE', isCorrect: false },
          { text: 'FETCH', isCorrect: false },
        ],
      },
      {
        quizId: sqlQuiz.id,
        text: 'Which types of JOINs are valid in SQL? (Select all that apply)',
        type: 'multiple' as const,
        explanation: 'INNER, LEFT, RIGHT, and FULL are all valid JOIN types.',
        order: 2,
        options: [
          { text: 'INNER JOIN', isCorrect: true },
          { text: 'LEFT JOIN', isCorrect: true },
          { text: 'RIGHT JOIN', isCorrect: true },
          { text: 'MIDDLE JOIN', isCorrect: false },
        ],
      },
      {
        quizId: sqlQuiz.id,
        text: 'What does the WHERE clause do?',
        type: 'single' as const,
        explanation: 'WHERE filters records based on specified conditions.',
        order: 3,
        options: [
          { text: 'Sorts the results', isCorrect: false },
          { text: 'Filters records based on conditions', isCorrect: true },
          { text: 'Groups the results', isCorrect: false },
          { text: 'Limits the number of results', isCorrect: false },
        ],
      },
    ];

    // Insert all questions and options
    const allQuestions = [...jsQuestions, ...reactQuestions, ...pythonQuestions, ...sqlQuestions];

    for (const q of allQuestions) {
      const [question] = await db
        .insert(questions)
        .values({
          quizId: q.quizId,
          text: q.text,
          type: q.type,
          explanation: q.explanation,
          order: q.order,
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
    }

    console.log('Seed completed successfully!');
    console.log(`Created:`);
    console.log(`  - 1 admin user (admin@mcqquiz.com / admin123)`);
    console.log(`  - 4 categories`);
    console.log(`  - 4 quizzes with ${allQuestions.length} questions`);
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

seed();
