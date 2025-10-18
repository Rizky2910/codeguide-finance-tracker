flowchart TD
    A[Start App] --> B{Authenticated?}
    B -- Yes --> C[Dashboard]
    B -- No --> D[Sign In Page]
    D --> E[Clerk Sign In]
    E --> B
    C --> F[Transactions Page]
    C --> G[Budgets Page]
    C --> H[Goals Page]
    C --> I[Reports Page]
    C --> J[AI Chat Interface]
    F --> K[Transaction Form]
    K --> L[/api/transactions]
    G --> M[Budget Form]
    M --> N[/api/budgets]
    H --> O[Goals Form]
    O --> P[/api/goals]
    I --> Q[Fetch Reports Data]
    Q --> R[/api/reports]
    J --> S[/api/chat]
    L --> T[Supabase Database]
    N --> T
    P --> T
    R --> T
    S --> T
    T --> L
    T --> N
    T --> P
    T --> R
    T --> S