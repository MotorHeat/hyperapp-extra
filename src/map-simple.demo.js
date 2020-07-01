import { Delay, Dispatch } from 'hyperapp-fx'
import { h, app, Map, mapper, rootMapper } from './hyperapp'
import { mnt } from './ha-map'
import { Counter } from './components/counter'
import { CounterSubs } from './components/cnt'

/// //////////// Custom edit box. Can edit any string value ///////////////
// model: string
const SetTextAction = (state, text) => ({ ...state, value: text })

const Edit = ({ value }, map) =>
  h('input', {
    type: 'text',
    oninput: [map(SetTextAction), e => e.target.value],
    value: value
  })

// view = (state, map, children)
const WithMap = (view, getter, setter, parentMap) => {
  const map = mnt(getter, setter, parentMap)
  return (state, children) => view(getter(state), map, children)
}
// Counter with editable title

const ToggleEditing = state => ({ ...state, editing: !state.editing })

const CounterWithTitle = (state, map) => {
  // eslint-disable-next-line no-unused-vars
  const { title, counter, editing } = state

  return h('div', {}, [
    !editing && h('p', {}, title),
    editing && h(WithMap(Edit, s => ({ value: s.title }), (s, v) => s.title = v.value, map), state),
    h('button', { onclick: map(ToggleEditing) }, 'Toggle title edit')
  ])
}
// Main view

const initialState = {
  mainCounter: 0,
  counter: 101,
  counter2: 21,
  counter3: 0,
  counterWithTitle: {
    title: 'Hello Hyperapp!',
    counter: 21
  }
}

const IncCounter3 = state => {
  console.log(state)
  return ({ ...state, counter3: state.counter3 + 1 })
}

const mainView = state =>
  h('div', {}, [
    h(WithMap(Counter, s => ({ counter: s.counter }), (s, v) => s.counter = v.counter), state),
    h(WithMap(CounterWithTitle, s => s.counterWithTitle, (s, v) => s.counterWithTitle = v), state)
  ])

const IncAction = state => ({ ...state, counter: state.counter + 1 })
const DecAction = state => ({ ...state, counter: state.counter - 1 })
const DelayedInc = state => [
  state,
  Delay({
    wait: 1000,
    action: IncAction
  })
]
const Cnt = ({ counter }, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: IncAction }, '+'),
    h('button', { onclick: DecAction }, '-'),
    h('button', { onclick: DelayedInc }, '+ (delayed)'),
    ...children
  ])

const MainCounter = Map(Cnt, s => ({ counter: s.mainCounter }), (s, v) => s.mainCounter = v.counter)

const counter3mapper = mapper(s => ({ counter: s.counter3 }), (s, v) => s.counter3 = v.counter)
const counter2mapper = mapper(
  s => ({ counter: s.counter2 }),
  (s, v) => {
    if (s.counter2 === v.counter) return
    s.counter2 = v.counter
    return [
      s,
      // Delay({
      //   wait: 1,
      //   action: IncCounter3
      // })
      Dispatch(IncCounter3)
    ]
  }
)

const Counter3 = Map(Cnt, counter3mapper)
const Counter2 = Map(Cnt, counter2mapper)

const mainView2 = state =>
  h('div', {}, [
    h('p', {}, `Counter3: ${state.counter3}`),
    h(Counter2, { counter: state.counter2 }),
    h(Counter3, Counter3.getter(state), [
      h('h2', {}, 'Counter 3 children. Dispaly counter 2'),
      h(Map(Cnt, rootMapper(s => ({ counter: s.counter2 }), (s, v) => s.counter2 = v.counter)), { counter: state.counter2 })
    ]),
    h('h2', {}, `Total: ${state.mainCounter + state.counter2 + state.counter3}`)
  ])

function mainSubscriptions (state, m) {
  return [
    // CounterSubs(state, m.concat([mapper(s => ({ counter: s.counter2 }), (s, v) => s.counter2 = v.counter)])),
    // CounterSubs(state, m.concat([counter3mapper]))
  ]
}

app(
  {
    init: initialState,
    node: document.getElementById('app'),
    view: mainView2,
    subscriptions: mainSubscriptions
  }
)
