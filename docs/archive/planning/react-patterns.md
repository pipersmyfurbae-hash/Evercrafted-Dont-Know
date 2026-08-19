# React Patterns & Code Structure

## Component Anatomy

Every React artifact follows this structure:

```jsx
import { useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_STATE = { ... };

// ─── Sub-components ──────────────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(INITIAL_STATE);

  return (
    <div style={styles.app}>
      {/* content */}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  app: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#0f1117",
    color: "#e8eaf0",
    minHeight: "100vh",
    padding: "2rem",
    maxWidth: 900,
    margin: "0 auto",
  },
  card: {
    background: "#1a1d27",
    border: "1px solid #2e3147",
    borderRadius: 12,
    padding: "1.5rem",
  },
  // ...
};
```

**Key rules:**
- Constants and helpers at the top
- Sub-components before the main component
- Styles object at the bottom — never inline unless dynamic
- Default export is always the root component

---

## State Management Patterns

### Simple local state
```jsx
const [value, setValue] = useState("");
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Grouped state for related fields
```jsx
// Instead of 5 separate useState calls for a form:
const [form, setForm] = useState({ name: "", email: "", message: "" });
const updateForm = (field) => (e) =>
  setForm(prev => ({ ...prev, [field]: e.target.value }));
// Usage: onChange={updateForm("name")}
```

### Async state pattern (loading + error + data)
```jsx
const [state, setState] = useState({ data: null, loading: false, error: null });

async function fetchData() {
  setState(prev => ({ ...prev, loading: true, error: null }));
  try {
    const result = await someApi();
    setState({ data: result, loading: false, error: null });
  } catch (err) {
    setState({ data: null, loading: false, error: err.message });
  }
}
```

### Conversation history for multi-turn chat
```jsx
const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content: string }

function addMessage(role, content) {
  setMessages(prev => [...prev, { role, content }]);
}
```

---

## Inline Style Best Practices

Since Tailwind isn't available in artifacts, use inline styles correctly:

```jsx
// ✅ Good — use the styles object
<div style={styles.card}>

// ✅ Good — dynamic values computed inline
<div style={{ ...styles.card, opacity: isDisabled ? 0.5 : 1 }}>

// ✅ Good — conditional class-like merging
<div style={{ ...styles.btn, ...(isPrimary ? styles.btnPrimary : styles.btnGhost) }}>

// ❌ Bad — magic values everywhere
<div style={{ background: "#1a1d27", borderRadius: "12px", padding: "24px" }}>
```

---

## Event Handling

```jsx
// Button click
<button onClick={handleSubmit} disabled={loading}>
  {loading ? "Loading..." : "Submit"}
</button>

// Input change
<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
/>

// Never use <form> tags — use div + onClick instead
<div>
  <input value={query} onChange={(e) => setQuery(e.target.value)} />
  <button onClick={handleSearch}>Search</button>
</div>
```

---

## Common Component Patterns

### Loading state
```jsx
if (state.loading) return (
  <div style={styles.center}>
    <div style={styles.spinner} />
    <p style={{ color: "#8b90a8", marginTop: 12 }}>Loading...</p>
  </div>
);
```

### Error state
```jsx
{state.error && (
  <div style={styles.errorBanner}>
    ⚠️ {state.error}
  </div>
)}
```

### Empty state
```jsx
{items.length === 0 && !loading && (
  <div style={styles.emptyState}>
    <p>No items yet. Add one to get started.</p>
  </div>
)}
```

### Chat message list (auto-scroll)
```jsx
const bottomRef = useRef(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

// In JSX:
<div style={styles.messageList}>
  {messages.map((msg, i) => (
    <div key={i} style={msg.role === "user" ? styles.userMsg : styles.assistantMsg}>
      {msg.content}
    </div>
  ))}
  <div ref={bottomRef} />
</div>
```

---

## Available Libraries (import directly)

```jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LineChart, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Camera, Search, ChevronDown, X } from "lucide-react"; // lucide-react@0.383.0
import * as math from "mathjs";
import _ from "lodash";
```

**Never import from local paths.** All imports must be from available CDN packages.

---

## Performance Tips

- Use `useCallback` for handlers passed as props to child components
- Use `useMemo` for expensive computed values
- Avoid creating new objects/arrays in render — define them outside or memoize
- For lists, always provide a stable `key` prop (never use array index if items can be reordered)

---

## Code Quality Checklist

- [ ] No `console.log` left in final output
- [ ] No `<form>` tags — use `div` + `onClick`
- [ ] No `localStorage` or `sessionStorage`
- [ ] Every async function has error handling
- [ ] All interactive elements have hover/active/disabled styles
- [ ] Large components split into named sub-components
- [ ] Styles object at the bottom, not scattered inline
