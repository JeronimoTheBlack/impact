---
layout: playground
code: |
    import { useState } from 'react'

    export default function App() {
        const [count, setCount] = useState(0)

        const increase = () => {
            setCount(count + 1)
        }

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }
next: /closures
---

# State management

In this tutorial we will discuss and learn about state management in React. Why do we even need more primitives than what React offers? What do we mean by **reactive**, is not React already reactive? And why is reactive state management better than traditional React state management?

In this example we start with a `count` and the ability to `increase` that count. Let us now first explore why state management in React is difficult and then we'll continue learning how **Impact** resolves these challenges.
