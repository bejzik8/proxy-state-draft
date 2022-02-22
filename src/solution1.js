const proxySubscribersMap = new WeakMap()
// const SUBSCRIBE_METHOD = Symbol()

const toBeNotified = new Set()
function notifyNext(fn) {
    toBeNotified.add(fn)
    Promise.resolve().then(flush)
}
function flush() {
    for (const fn of toBeNotified) {
        fn()
    }
    toBeNotified.clear()
}

export function proxy(obj) {
    const subscribers = new Set()
    let initialised = false

    const result = new Proxy({}, {
        get(target, property) {
            // if (property === SUBSCRIBE_METHOD) {
            //     return subscribers
            // }
            return target[property]
        },
        set(target, property, value) {
            if (initialised && obj[property] === value) return true

            obj[property] = value
            if (typeof value === 'object') {
                value = proxy(value)
            }
            target[property] = value

            subscribers.forEach(subscriber => {
                notifyNext(subscriber)
            })

            return true
        }
    })

    for (const key in obj) {
        result[key] = obj[key]
    }

    initialised = true

    proxySubscribersMap.set(result, subscribers)

    return result
}

export function subscribe(proxyObj, callback) {
    if (!proxySubscribersMap.has(proxyObj)) {
        throw new Error('proxyObj is not a proxy')
    }
    proxySubscribersMap.get(proxyObj).add(callback)
    // proxyObj[SUBSCRIBE_METHOD].add(callback)

    return () => {
        proxySubscribersMap.get(proxyObj).delete(callback)
    }
}