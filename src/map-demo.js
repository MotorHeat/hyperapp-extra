import { h, app } from 'hyperapp'
import { mnt } from './ha-map'

/// //////////// Counter component ///////////////
// Model: { greeting: string, counter: number }

const IncrementAction = state => ({ ...state, counter: state.counter + 1 })
const DecrementAction = state => ({ ...state, counter: state.counter - 1 })
const ResetAction = state => ({ ...state, counter: 0 })

const CounterWithTitle = ({ greeting, counter, map }, children) =>
  h('div', {}, [
    h('h2', {}, greeting),
    h('p', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])

// //////////// Counter Manager component ///////////////
// Model: []

const AppendCounterAction = (state, counter) => {
  const result = [...state]
  result.push(counter)
  return result
}

const CreateCounterAction = state => AppendCounterAction(state, { greeting: 'New counter ' + state.length, counter: state.length })

const DeleteCounterAction = state => {
  const p = [...state]
  p.splice(0, 1)
  return p
}

function CounterList ({ counters, map }) {
  return h('div', {}, [
    h('button', { onclick: map(CreateCounterAction) }, 'New counter'),
    h('button', { onclick: map(DeleteCounterAction) }, 'Remove counter'),
    h('ul', {},
      counters.map((c, i) => h('li', {}, h(CounterWithTitle,
        {
          ...c,
          map: mnt(s => s[i], (s, v) => s[i] = v, map)
        })
      ))
    )]
  )
}

/// //////////// Custom edit box. Can edit any string value ///////////////
// model: string
const SetTextAction = (state, text) => text

const Edit = ({ value, map }) =>
  h('input', {
    type: 'text',
    oninput: [
      map(SetTextAction),
      e => e.target.value
    ],
    value: value
  })

// Application state

const initialState = {
  mainCounter: {
    greeting: 'Main Counter',
    counter: 0
  },
  counters: []
}

/// //////////// Main View function ///////////////

// Getters and setters can be explicitly defined. Not sure if this has any scense
const RenameAllCountersSetter = (s, v) => s.counters = s.counters.map(c => ({ ...c, greeting: v }))
const CountersGetter = s => s.counters
const CountersSetter = (s, v) => s.counters = v

const MainCounterGetter = s => s.mainCounter
const MainCounterSetter = (s, v) => s.mainCounter = v

function view (state) {
  return h('div', {}, [
    h('h1', {}, 'State and Actions mapping Demo'),
    h(CounterWithTitle,
      {
        // greeting: state.mainCounter.greeting,
        // counter: state.mainCounter.counter,
        // map: mnt(s => s.mainCounter, (s, v) => s.mainCounter = v)
        ...MainCounterGetter(state),
        map: mnt(MainCounterGetter, MainCounterSetter)
      },
      h('p', {}, 'This is the main counter!')
    ),
    h('p', {}, 'Rename main counter'),
    h(Edit,
      {
        value: state.mainCounter.greeting,
        map: mnt(s => s.mainCounter.greeting, (s, v) => s.mainCounter.greeting = v)
      }
    ),
    (state.counters && !!state.counters.length) && [
      h('h3', {}, 'Rename all managed counters'),
      h(Edit,
        {
          value: state.counters[0].greeting, // Here we have extreme case: we read single value but save value to many objects
          map: mnt(s => s.counters[0].greeting, RenameAllCountersSetter)
        },
        'Paragrph 2'
      )
    ],
    h('h3', {}, 'Counter Manager'),
    h(CounterList,
      {
        counters: CountersGetter(state),
        map: mnt(CountersGetter, CountersSetter)
      }
    )
  ])
}

const node = document.getElementById('app')

app(
  {
    init: initialState,
    node: node,
    view: view
  }
)
