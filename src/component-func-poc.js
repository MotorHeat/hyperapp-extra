import { Delay, Dispatch } from 'hyperapp-fx'
import { h, app, Map, MapState } from './hyperapp'
import { mnt } from './ha-map'
import { Counter } from './components/counter'

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
  counter3Direction: 1,
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
  console.log('IncCounter3', state)
  return ({ ...state, counter3: state.counter3 + 1 })
}

const DecCounter3 = state => {
  console.log('DecCounter3', state)
  return ({ ...state, counter3: state.counter3 - 1 })
}

const mainView = state =>
  h('div', {}, [
    h(WithMap(Counter, s => ({ counter: s.counter }), (s, v) => s.counter = v.counter), state),
    h(WithMap(CounterWithTitle, s => s.counterWithTitle, (s, v) => s.counterWithTitle = v), state)
  ])

const IncAction = state => ({ ...state, counter: state.counter + 1 })
const DecAction = state => ({ ...state, counter: state.counter - 1 })
const IncDecAction = state => [
  IncAction(state),
  Delay(({
    wait: 500,
    action: DecAction
  }))
]
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
    h('button', { onclick: IncDecAction }, '+-'),
    ...children
  ])

function NotMoreThan50 (state) {
  return {
    ...state,
    counter: state.counter > 50 ? 50 : state.counter
  }
}

function CntSubscriptions (state) {
  return [
    intervalRun,
    {
      interval: 10,
      action: NotMoreThan50
    }
  ]
}

const MappedCnt = Map(Cnt, s => ({ counter: s.mainCounter }), (s, v) => s.mainCounter = v.counter)

const mainView2 = state =>
  h('div', {}, [
    // h(Cnt, { counter: state.counter })
    // h(MappedCnt, { counter: state.mainCounter }),
    h('p', {}, `Counter3: ${state.counter3}`),
    MapState(s => ({ counter: s.counter2 }), (s, v) => {
      if (s.counter2 === v.counter) return
      s.counter2 = v.counter
      return [
        s,
        Dispatch(IncCounter3)
      ]
    }, [
      h('h1', {}, 'MapState'),
      h(Cnt, { counter: state.counter2 })
    ]),
    h(Map(Cnt, s => ({ counter: s.counter2 }), (s, v) => {
      if (s.counter2 === v.counter) return
      s.counter2 = v.counter
      return [
        s,
        Delay({
          wait: 1,
          action: IncCounter3
        })
      ]
    }), { counter: state.counter2 }),
    h(Map(Cnt, s => ({ counter: s.counter3 }), (s, v) => s.counter3 = v.counter), { counter: state.counter3 })
    // h('h2', {}, `Total: ${state.mainCounter + state.counter2 + state.counter3}`)

  ])

const mainComponentView = state =>
  h('div', {}, [
    // h(Cnt, { counter: state.counter })
    // h(MappedCnt, { counter: state.mainCounter }),
    h('p', {}, `Counter3: ${state.counter3}`),
    MapState(s => ({ counter: s.counter2 }), (s, v) => {
      if (s.counter2 === v.counter) return
      s.counter2 = v.counter
      return [
        s,
        Dispatch(IncCounter3)
      ]
    }, [
      h('h1', {}, 'MapState'),
      h(Cnt, { counter: state.counter2 })
    ]),
    h(Map(Cnt, s => ({ counter: s.counter2 }), (s, v) => {
      if (s.counter2 === v.counter) return
      s.counter2 = v.counter
      return [
        s,
        Delay({
          wait: 1,
          action: IncCounter3
        })
      ]
    }), { counter: state.counter2 }),
    h(Map(Cnt, s => ({ counter: s.counter3 }), (s, v) => s.counter3 = v.counter), { counter: state.counter3 })
    // h('h2', {}, `Total: ${state.mainCounter + state.counter2 + state.counter3}`)

  ])

function mainComponentSubscriptions (state) {
  // var map = mnt(s => s.counter3, (s, v) => s.counter3 = v)
  // var cntSubs = CntSubscriptions(map(state))
  return [
    // state.counter3Direction > 0 && [intervalRun, { action: IncCounter3, interval: 100 }],
    // state.counter3Direction < 0 && [intervalRun, { action: DecCounter3, interval: 100 }],
    // [intervalRun,
    //   {
    //     action: adjustCounterDirection,
    //     interval: 100
    //   }
    // ],
    ...CntSubscriptions(state)
  ]
}

function intervalRun (dispatch, options) {
  const i = setInterval(() => dispatch(options.action), options.interval)
  return () => clearInterval(i)
}

function adjustCounterDirection (state) {
  return ({ ...state, counter3Direction: state.counter3 > 100 ? -1 : state.counter3 < -100 ? +1 : state.counter3Direction })
}

app(
  {
    init: initialState,
    node: document.getElementById('app'),
    view: mainComponentView,
    subscriptions: mainComponentSubscriptions
  }
)
