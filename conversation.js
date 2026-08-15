/**
 * conversation.js
 * Few-shot prompting template for IT & Software Engineering topics.
 * Teaches the model structured, concise, and production-ready formatting.
 */

const initialMessages = [
  // --- Few-Shot Example 1: Code Debugging / Error Resolution ---
  {
    role: "user",
    content: "Why am I getting 'TypeError: Cannot read properties of undefined (reading 'map')' in React?"
  },
  {
    role: "assistant",
    content: `### Root Cause
This happens when you call \`.map()\` on a state variable or prop that is currently \`undefined\` (usually before an async API fetch finishes).

### Solution
Provide a fallback default or use optional chaining:

\`\`\`javascript
// Option 1: Optional chaining with fallback
const list = data?.items?.map(item => <li key={item.id}>{item.name}</li>) || [];

// Option 2: Initialize state with an empty array
const [items, setItems] = useState([]);
\`\`\``
  },

  // --- Few-Shot Example 2: Architecture & System Design ---
  {
    role: "user",
    content: "When should we use Redis in a backend architecture?"
  },
  {
    role: "assistant",
    content: `### Key Use Cases for Redis
- **In-Memory Caching:** Reduce database read load for high-traffic, slow-changing queries.
- **Session Management:** Centralized session store across multiple stateless server instances.
- **Rate Limiting:** Track API request counters with automatic key expiration (\`TTL\`).
- **Pub/Sub & Queues:** Lightweight message distribution between microservices.

**Trade-off:** Data resides in RAM, requiring persistence strategies (RDB/AOF) if data loss on restart is unacceptable.`
  },

  // --- Few-Shot Example 3: Tech Comparison & Trade-offs ---
  {
    role: "user",
    content: "PostgreSQL vs MongoDB: How do I choose for a new SaaS product?"
  },
  {
    role: "assistant",
    content: `### Decision Matrix

| Requirement | Recommended | Why |
| :--- | :--- | :--- |
| **Relational / Financial Data** | **PostgreSQL** | Strict ACID compliance, foreign keys, transactional safety |
| **Dynamic / Polymorphic Schemas** | **MongoDB** | Flexible document model, rapid schema iteration |
| **Complex Analytics & Joins** | **PostgreSQL** | Mature query planner, indexing, and native JSONB support |
| **Rapid Prototyping** | **MongoDB** | Minimal upfront schema migration overhead |`
  },

  // --- Few-Shot Example 4: DevOps & Infrastructure / CLI ---
  {
    role: "user",
    content: "How do I inspect memory usage per container in Docker?"
  },
  {
    role: "assistant",
    content: `Run the live statistics stream:

\`\`\`bash
# Real-time stream of CPU, Memory, and Network I/O
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
\`\`\`

To inspect a single container non-streaming:
\`\`\`bash
docker stats --no-stream <container_id_or_name>
\`\`\``
  },

  // --- Few-Shot Example 5: Security / Best Practices ---
  {
    role: "user",
    content: "Where should we store JWT tokens in a web app?"
  },
  {
    role: "assistant",
    content: `### Recommendation: \`HttpOnly\`, \`Secure\` Cookies
- **Why:** Prevents access via client-side JavaScript, mitigating **Cross-Site Scripting (XSS)** token theft.
- **Mitigation:** Protect against **CSRF** by setting \`SameSite=Strict\` or \`SameSite=Lax\`.

*Avoid \`localStorage\` for sensitive session tokens unless paired with strict Content Security Policies (CSP).*`
  },

  // --- Example 6: Open turn ready for testing ---
  {
    role: "user",
    content: "What IT architecture or development topic would you like to review next?"
  },
  {
    role: "assistant",
    content: "Ready for your next topic. You can ask for code reviews, database schema designs, cloud infrastructure setups, or debugging assistance."
  }
];

export default initialMessages;