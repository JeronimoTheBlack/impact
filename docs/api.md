---
outline: deep
---

# API

## globalStore

A reactive global store. An abstraction over [globalContext](#globalcontext) and [store](#store). Can be accessed by any component.

```tsx
import { globalStore } from 'impact-react'

const useStore = globalStore({
    count: 0,
    increase() {
        this.count++
    },
    get doubleCount() {
        return this.count * 2
    }
})
```

## globalContext

A reactive global context allows for composition of [stores](#store), [signals](#signal), [derived](#deribed) and [effects](#effect). Can be consumed directly by any component.

```tsx
import { globalContext, store } from 'impact-react'

const useStore = globalContext(() => {
    const counter = store({
        count: 0
    })
    const messages = store({
        current: ''
    })

    return {
        counter,
        messages
    }
})
```

## store

A reactive store. An abstraction over [signals](#signal) and [derived](#derived). It co-locates an protects state changes with methods and getters which are converted to derived signals. It needs to be exposed through a [globalContext](#globalcontext) or [context](#context) to be observed by components.

```ts
import { store } from 'impact-react'

const counterStore = store({
    count: 0,
    increase() {
        this.count++
    },
    get doubleCount() {
        return this.count * 2
    }
})
```

## signal

Reactive state. The value is considered immutable and needs to be replaced. If replaced with the same value, the signal will not trigger. It needs to be exposed through a [globalContext](#globalcontext) or [context](#context) to be observed by components.

```ts
import { signal } from 'impact-react'

const count = signal(0)

console.log(count.value)
count.value = 10
```

## derived

Derived reactive state. Will observe any signals or other derived in its callback. It lazily evaluates, which means when obseration triggers it only flags itself as dirty. The derived needs to be accessed to recaulcate its value. It needs to be exposed through a [globalContext](#globalcontext) or [context](#context) to be observed by components.

```ts
import { signal, derived } from 'impact-react'

const count = signal(0)
const doubleCount = derived(() => count * 2)

count.value = 10
console.log(doubleCount.value)
```

## effect

Reactive effect. Will oberve and signals or derived in its callback. It runs immediately and will run again whenever obervation triggers. If an effect both observes and sets the same signal, the observation is ignored.

```ts
import { effect, signal } from 'impact-react'

const count = signal(0)

effect(() => {
    console.log(count.value)
})
```

## context

A reactive context which allows scoped composition of [stores](#store), [signals](#signal), [derived](#deribed) and [effects](#effect). The context has to be exposed with its React Provider and can receive initial props from this provider. To remount the provider and pass new props, use a `key` prop.

```tsx
import { context, signal } from 'impact-react'

const useStore = context(({ initialCount }) => {
    const count = signal(initialCount)

    return {
        get count() {
            return count.value
        }
    }
})

function App() {
    return (
        <useStore.Provider initialCount={10}>
            <Content />
        </useStore.Provider>
    )
}
```