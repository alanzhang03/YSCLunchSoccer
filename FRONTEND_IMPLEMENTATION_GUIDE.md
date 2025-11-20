# Frontend Implementation Guide
## What You Need to Add to Your Signup & Login Pages

I've added CSS styling to your pages. Now here's what you need to implement to make them functional:

---

## 📋 Step-by-Step Implementation

### **1. Update Your Signup Page Structure**

Your signup page needs to:
- Use the CSS classes I added (`.container`, `.card`, `.formGroup`, etc.)
- Add all required fields (phone, email, name, password)
- Handle form submission properly

**Current issues to fix:**
- ❌ Missing `email` field (required by your backend)
- ❌ Missing `name` field (required by your backend)
- ❌ Handlers don't update state (`handlePhoneNum`, `handlePassword` are empty)
- ❌ No form submission logic
- ❌ Not using the CSS classes you have

**What to add:**
```javascript
// Add these state variables:
const [email, setEmail] = useState("");
const [name, setName] = useState("");
// Update handlers to actually set state:
const handlePhoneNum = (e) => setPhoneNum(e.target.value);
const handlePassword = (e) => setPassword(e.target.value);
// Add form submission handler
const handleSubmit = async (e) => {
  e.preventDefault();
  // Call your signup API function here
};
```

**Structure your JSX like this:**
```jsx
<div className={styles.container}>
  <div className={styles.card}>
    <h1 className={styles.title}>Sign Up</h1>
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>First Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {/* ... other fields ... */}
      <button type="submit" className={styles.button}>Submit</button>
    </form>
  </div>
</div>
```

---

### **2. Update Your Login Page**

**Current issues to fix:**
- ❌ Password input type should be `"password"` not `"text"` (security issue!)
- ❌ Not using CSS classes
- ❌ No actual API call in `handleSubmit`

**What to fix:**
```javascript
// Change password input type:
<input type="password" ... />  // Not type="text"

// Update handleSubmit to call your login API
const handleSubmit = async (event) => {
  event.preventDefault();
  // Call your login API function here
};
```

---

### **3. Create Auth API Functions**

You need to create `frontend/src/lib/auth.js` with functions to call your backend:

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Helper to send cookies with requests
const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include", // CRITICAL: sends cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

export async function signup(phone, email, name, password) {
  const response = await fetchWithCredentials(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ phone, email, name, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed");
  }
  
  return response.json();
}

export async function login(phone, password) {
  const response = await fetchWithCredentials(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  
  return response.json();
}
```

**Why `credentials: "include"`?**
- Your backend uses session cookies for authentication
- Without this, cookies won't be sent/received
- This is required for session-based auth to work

---

### **4. Add Error Handling**

Both pages should display errors to users:

```javascript
const [error, setError] = useState("");

// In your submit handler:
try {
  await signup(...);
  // Success - redirect or show success message
} catch (err) {
  setError(err.message); // Display error
}

// In your JSX:
{error && <div className={styles.error}>{error}</div>}
```

---

### **5. Add Loading States**

Prevent double submissions and show user feedback:

```javascript
const [loading, setLoading] = useState(false);

// In submit handler:
setLoading(true);
try {
  await signup(...);
} finally {
  setLoading(false);
}

// Disable button and inputs when loading:
<button type="submit" disabled={loading} className={styles.button}>
  {loading ? "Signing up..." : "Sign Up"}
</button>
<input disabled={loading} ... />
```

---

### **6. Add Navigation After Success**

After successful signup/login, redirect to home page:

```javascript
import { useRouter } from "next/navigation";

const router = useRouter();

// After successful signup/login:
router.push("/");
```

---

### **7. Remove Default Values (Security Issue!)**

**Current problem:**
```javascript
const [phoneNum, setPhoneNum] = useState("444-444-4444"); // ❌ Remove this!
const [password, setPassword] = useState("Password"); // ❌ Remove this!
```

**Should be:**
```javascript
const [phoneNum, setPhoneNum] = useState(""); // ✅ Empty string
const [password, setPassword] = useState(""); // ✅ Empty string
```

---

### **8. Update Existing API Calls**

Your `frontend/src/lib/api.js` functions also need `credentials: "include"`:

```javascript
// Update getSessions, attendSession, etc. to use:
fetch(url, {
  credentials: "include", // Add this
  // ... rest of options
});
```

---

## 🎯 Quick Checklist

### Signup Page:
- [ ] Add `email` field
- [ ] Add `name` field  
- [ ] Fix handlers to update state
- [ ] Add form submission handler
- [ ] Import and call `signup()` from `lib/auth.js`
- [ ] Add error state and display
- [ ] Add loading state
- [ ] Use CSS classes (`.container`, `.card`, `.formGroup`, `.button`)
- [ ] Remove default values from state
- [ ] Add navigation after success

### Login Page:
- [ ] Change password input type to `"password"`
- [ ] Import and call `login()` from `lib/auth.js`
- [ ] Add error state and display
- [ ] Add loading state
- [ ] Use CSS classes
- [ ] Remove default values from state
- [ ] Add navigation after success

### General:
- [ ] Create `lib/auth.js` with signup/login functions
- [ ] Ensure all fetch calls use `credentials: "include"`
- [ ] Test that backend auth routes exist and work

---

## 🔍 Testing Your Implementation

1. **Test Signup:**
   - Fill all fields
   - Submit form
   - Check browser DevTools → Application → Cookies
   - Should see a session cookie set
   - Should redirect to home page

2. **Test Login:**
   - Use credentials from signup
   - Should see session cookie
   - Should redirect to home page

3. **Test Errors:**
   - Try duplicate phone/email (should show error)
   - Try wrong password (should show error)
   - Try invalid data (should show validation error)

---

## 🐛 Common Issues

1. **"Cookies not being sent"**
   - Make sure `credentials: "include"` is in all fetch calls
   - Check backend CORS allows credentials

2. **"CORS errors"**
   - Backend needs: `cors({ origin: "http://localhost:3000", credentials: true })`

3. **"Form not submitting"**
   - Make sure `onSubmit` handler calls `e.preventDefault()`
   - Check that button has `type="submit"`

4. **"State not updating"**
   - Handlers need to call setState: `onChange={(e) => setPhoneNum(e.target.value)}`

---

## 📝 Example Complete Signup Handler

Here's a complete example of what your signup handler should look like:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await signup(phoneNum, email, name, password);
    console.log("Signup successful:", result);
    router.push("/"); // Redirect to home
  } catch (err) {
    setError(err.message); // Show error to user
  } finally {
    setLoading(false);
  }
};
```

---

Good luck! The CSS is ready - now you just need to wire up the functionality! 🚀

