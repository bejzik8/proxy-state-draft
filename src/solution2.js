const pathCache = new WeakMap()
const proxyCache = new WeakMap()

const proxyHandler = {
    get(tgt, prop, rcvr) {
        console.log(`Getting ${prop}`)

        const value = Reflect.get(tgt, prop, rcvr)

        if (typeof value === 'string') {
            return value
        }

        let path = pathCache.get(tgt)

        if (path === '') {
            path += '.'
        }

        return buildProxy(value, `${path}${prop}`)
    },
    set(tgt, prop, val, rcvr) {
        console.log(`Setting ${prop} to ${val}`)

        return Reflect.set(tgt, prop, val, rcvr)
    }
}

function buildProxy(val, prop) {
    pathCache.set(val, prop)

    let proxy = proxyCache.get(val)

    if (proxy === undefined) {
        try {
            proxy = new Proxy(val, proxyHandler)
        } catch (err) {}

        proxyCache.set(val, proxy)
    }

    return proxy
}

const state = buildProxy({}, '')

state.person = {
    firstName: 'Mirko',
    lastName: 'Basic'
}

console.log(state.person.firstName)

state.person = {
    firstName: 'M',
    lastName: 'B'
}