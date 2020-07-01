// type Action<S> = (state: S, options?: any) => S

// type Mapper<X,Y> = ( (s: X) => Y )
//                  | ( (s: X, v: Y) => X )
//                  | ( (action: Action<X>) => Action<Y> )

// type Getter<S,U> = (s: S) => U
// type Setter<S,U> = (s: S, v: U) => S
// type Mount<S,U,G> = ( (get: Getter<S,U>, set: Setter<S,U>, parent: Mapper<G,S>) => Mapper<G,U> )
//                   | ( (get: Getter<G,U>, set: Setter<G,U>                     ) => Mapper<G,U> )
// // S - is type of current state
// // U - is type of state that we want to extract from current and inject to children
// // G - type of application global state
// // if parent is not specified then it is assumed that S is G

// function mnt<S,U,G> (get: Getter<S,U>, set: Setter<S,U>, parent: Mapper<G,S>): Mapper<G,U>;
// function mnt<S,U,G> (get: Getter<G,U>, set: Setter<G,U>): Mapper<G,U>;

// export function mnt (getter, setter, parentMapper) {
//   if (parentMapper && typeof (parentMapper) !== 'function') throw new Error('Parent mapper must be a function')
//   return function mapper (globalState, newValue) {
//     if (arguments.length !== 1 && arguments.length !== 2) {
//       throw new Error('Wrong number of arguments for mapper')
//     }

//     if (typeof (globalState) === 'function') {
//       // this is the case when we map action and not the state. So return a new action that will get mapped state instead of global one
//       return mapAction(globalState, mapper)
//     }

//     if (arguments.length === 1) {
//       return parentMapper ? getter(parentMapper(globalState)) : getter(globalState)
//     } else {
//       if (parentMapper) {
//         const parentState = parentMapper(globalState)
//         const current = getter(parentState)
//         if (isSimilar(current, newValue)) return globalState
//         return parentMapper(globalState, nextState(parentState, newValue, setter))
//       } else {
//         const current = getter(globalState)
//         if (isSimilar(current, newValue)) return globalState
//         return nextState(globalState, newValue, setter)
//       }
//     }
//   }
// }

// function isSimilar (a, b) {
//   if (a === b) {
//     return true
//   }

//   const protoA = Object.getPrototypeOf(a)
//   const protoB = Object.getPrototypeOf(b)

//   if (protoA !== protoB) {
//     return false
//   }

//   if (protoA !== Object.getPrototypeOf({}) && protoA !== Object.getPrototypeOf([])) {
//     return false // don't know how to compare non objects and non arrays (function, Set ...)
//   }

//   const pa = Object.keys(a)
//   const pb = Object.keys(b)
//   return pa.length === pb.length
//     && pa.every(p => pb.indexOf(p) >= 0)
//     && pa.every(p => a[p] === b[p])
// }

export const mnt = (getter, setter, parentMapper) => function mapper (globalState, ...newValue) {
  return typeof (globalState) === 'function'
    ? mapAction(globalState, mapper)
    : newValue.length === 0
      ? parentMapper
        ? getter(parentMapper(globalState))
        : getter(globalState)
      : parentMapper
        ? parentMapper(globalState, setValue(parentMapper(globalState), newValue[0], setter))
        : setValue(globalState, newValue[0], setter)
}

const mapAction = (action, map) => (state, options) => map(state, action(map(state), options))

const setValue = (state, value, setter) => {
  if (isStateWithEffects(value)) {
    const newState = Array.isArray(state) ? [...state] : { ...state }
    setter(newState, value[0])
    const result = [...value]
    result[0] = newState
    return result
  } else {
    const newState = Array.isArray(state) ? [...state] : { ...state }
    const withEffects = setter(newState, value)
    return Array.isArray(withEffects) ? withEffects : newState
  }
}

function isStateWithEffects (s) {
  return Array.isArray(s)
    && typeof (s[0]) !== 'function'
    && !Array.isArray(s[0])
}
