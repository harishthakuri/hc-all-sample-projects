# Understanding useAuth Hook

## What is useAuth?

`useAuth` is a **custom React hook** that manages all authentication-related functionality in your app. Think of it as a helper that handles user login, registration, and logout.

### What's a Custom Hook?

In React, a custom hook is a JavaScript function that:
- Starts with the word "use" (like `useAuth`, `useState`, `useEffect`)
- Can use other React hooks inside it
- Helps you reuse logic across different components

So instead of writing login/logout code in every component, you write it once in `useAuth` and reuse it everywhere!

## What Does useAuth Do?

This hook provides:
1. **User information** - Who is logged in?
2. **Authentication status** - Is someone logged in?
3. **Functions** - `login()`, `register()`, `logout()`

### How to Use It

```javascript
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Now you can use these in your component!
  if (isAuthenticated) {
    return <div>Welcome {user.name}!</div>;
  }
}
```

## Understanding the Login Function

Let's break down the `login` function step by step:

```javascript
const login = useCallback(async (email: string, password: string) => {
  // ... login code ...
}, [setAuth, setLoading, navigate, location.state, setSession, setInitialized]);
```

### What is `useCallback`?

`useCallback` is a React hook that **saves a function** so it doesn't get recreated every time your component re-renders.

Think of it like this:
- **Without `useCallback`**: Every time your component updates, React creates a brand new `login` function
- **With `useCallback`**: React reuses the same `login` function unless specific things change

### The Two Parameters of useCallback

```javascript
useCallback(
  // PARAMETER 1: The function you want to save
  async (email, password) => {
    // login code here
  },
  
  // PARAMETER 2: Dependency array
  [setAuth, setLoading, navigate, location.state, setSession, setInitialized]
)
```

### What's the Dependency Array? (The Second Parameter)

The dependency array `[...]` tells React: **"Only recreate this function if one of these things changes"**

```javascript
[setAuth, setLoading, navigate, location.state, setSession, setInitialized]
```

These are things the `login` function uses internally. If any of them change, React will create a new version of the `login` function. If they stay the same, React reuses the old one.

#### Why Does This Matter?

1. **Performance**: Reusing functions is faster than creating new ones
2. **Prevents bugs**: If you pass `login` to child components, it won't cause unnecessary re-renders

### What Happens Inside the Login Function?

Here's the login process step by step:

```javascript
const login = useCallback(async (email: string, password: string) => {
  // 1. Show loading state
  setLoading(true);
  
  try {
    // 2. Send login request to server
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // 3. Get the response data
    const data = await response.json();

    // 4. Check if login was successful
    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }

    // 5. Save user info and token
    setAuth(data.data.user, data.data.token);
    
    // 6. Save session token for later use
    storage.set(STORAGE_KEYS.SESSION_TOKEN, data.data.token);
    setSession({
      token: data.data.token,
      expiresAt: new Date(data.data.expiresAt),
    });
    setInitialized(true);
    
    // 7. Show success message
    toast({ title: 'Welcome back!', description: `Logged in as ${data.data.user.name}` });
    
    // 8. Redirect user to where they wanted to go
    const redirectPath = getRedirectPath();
    navigate(redirectPath, { replace: true });
    
  } catch (error) {
    // 9. If anything goes wrong, show error message
    const message = error instanceof Error ? error.message : 'Login failed';
    toast({ title: 'Error', description: message, variant: 'destructive' });
    throw error;
    
  } finally {
    // 10. Always hide loading state (even if there was an error)
    setLoading(false);
  }
}, [setAuth, setLoading, navigate, location.state, setSession, setInitialized]);
```

## Key Concepts Explained

### async/await

```javascript
async (email, password) => {
  const response = await fetch(...);
}
```

- `async` means "this function will do something that takes time"
- `await` means "wait for this to finish before continuing"
- Used for things like API calls that take time

### try/catch/finally

```javascript
try {
  // Try to do something
} catch (error) {
  // If it fails, handle the error
} finally {
  // Always run this code (success or failure)
}
```

### What's a Token?

A **token** is like a special password that proves you're logged in. After you log in with your email and password, the server gives you a token. Your app saves this token and sends it with every request to prove "I'm the logged-in user!"

## Full useAuth Return Object

```javascript
return {
  user,              // Current user info (name, email, etc.)
  token,             // Authentication token
  isAuthenticated,   // true if logged in, false if not
  isLoading,         // true while login/logout is happening
  isAdmin,           // true if user is an admin
  login,             // Function to log in
  register,          // Function to create account
  logout,            // Function to log out
};
```

## Example Usage

```javascript
function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Login successful! User will be redirected automatically
    } catch (error) {
      // Error is already shown via toast
      console.log('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Understanding Zustand Store (useAuthStore)

### What is Zustand?

Zustand is a **state management library** for React. It's like a global storage box that any component can access.

Think of it like this:
- **Regular useState**: Only one component can use it
- **Zustand store**: ALL components can access the same data

### How to Know What useAuthStore Provides

Look at the **TypeScript interface** at the top of the store file:

```typescript
interface AuthState {
  // These are the VALUES you can get
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // These are the FUNCTIONS you can call
  setAuth: (user: UserProfile, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
```


Pro tip: In VS Code, if you type useAuthStore(). and wait, autocomplete will show you all 7 things you can access:

- 4 values: user, token, isAuthenticated, isLoading

- 3 functions: setAuth, clearAuth, setLoading

The interface is like a contract - it tells you "this is exactly what this store provides, nothing more, nothing less!"



**Everything in this interface is what `useAuthStore()` provides!**

### Breaking Down the Interface

The interface has two types of things:

#### 1. State Values (Data)
```typescript
user: UserProfile | null;           // Current user object or null
token: string | null;                // Auth token or null
isAuthenticated: boolean;            // true/false - are they logged in?
isLoading: boolean;                  // true/false - is login happening?
```

#### 2. Actions (Functions)
```typescript
setAuth: (user, token) => void;      // Save user and token
clearAuth: () => void;               // Remove user and token
setLoading: (loading) => void;       // Set loading state
```

### How the Store is Built

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial values
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Functions that update the store
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    // ... persist options
  )
);
```

### How to Use the Store

#### Method 1: Get Everything
```typescript
const authStore = useAuthStore();

// Then use:
authStore.user
authStore.token
authStore.setAuth(user, token)
```

#### Method 2: Destructure What You Need (RECOMMENDED)
```typescript
const { user, token, isAuthenticated } = useAuthStore();

// Now you can use them directly:
if (isAuthenticated) {
  console.log(user.name);
}
```

#### Method 3: Get Only One Thing (Best Performance)
```typescript
// Only re-render when 'user' changes
const user = useAuthStore((state) => state.user);

// Only re-render when 'isAuthenticated' changes
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### Quick Reference: What useAuthStore Provides

| Name | Type | Description |
|------|------|-------------|
| `user` | UserProfile \| null | Current logged-in user info |
| `token` | string \| null | Authentication token |
| `isAuthenticated` | boolean | Whether user is logged in |
| `isLoading` | boolean | Whether auth action is in progress |
| `setAuth` | function | Save user and token |
| `clearAuth` | function | Remove user and token |
| `setLoading` | function | Set loading state |

### How to Find This Information

**Always look for the TypeScript interface!** It's your documentation:

```typescript
interface AuthState {  // ← This tells you EVERYTHING!
  // Look here for all available properties and functions
}
```

If you're using VS Code:
1. Hover over `useAuthStore` - you'll see the interface
2. Type `useAuthStore().` and autocomplete will show all options
3. Look at the interface definition in the file

### What is `persist`?

```typescript
persist(
  // store definition
  {
    name: 'mcq-auth',  // Storage key name
    partialize: (state) => ({  // What to save
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    }),
  }
)
```

`persist` saves your auth data to **localStorage** so when you refresh the page, you're still logged in!

- `name: 'mcq-auth'` - The key used in localStorage
- `partialize` - Which parts of the store to save (notice `isLoading` is NOT saved - we don't need to remember loading state)

## Summary

- **useAuth** is a custom hook that manages authentication
- **useCallback** saves functions to improve performance
- **Dependency array** tells React when to recreate the function
- **login function** handles the entire login process from API call to redirecting the user
- **Tokens** are used to prove you're logged in after the initial login
- **Zustand store** provides global state that any component can access
- **TypeScript interface** tells you exactly what the store provides
- **persist middleware** saves auth data to localStorage so you stay logged in after refresh