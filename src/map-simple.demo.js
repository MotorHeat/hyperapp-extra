import { h, app } from 'hyperapp'
import { mnt } from './ha-map'

/// //////////// Counter component ///////////////
const IncrementAction = counter => counter + 1
const DecrementAction = counter => counter - 1
const ResetAction = counter => 0

const Counter = ({ counter, map }, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])

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

// Counter with editable title

const ToggleEditing = state => ({ ...state, editing: !state.editing })

const CounterWithTitle = ({ title, counter, editing, map }) =>
  h('div', {}, [
    !editing && h('p', {}, title),
    editing && h(Edit, { value: title, map: mnt(s => s.title, (s, v) => s.title = v, map) }),
    h(Counter, { counter: counter, map: mnt(s => s.counter, (s, v) => s.counter = v, map) }),
    h('button', { onclick: map(ToggleEditing) }, 'Toggle title edit')
  ])

// Main view

const initialState = {
  counter: 0,
  counterWithTitle: {
    title: 'Hello Hyperapp!',
    counter: 21
  }
}

const CounterWithTitleGetter = s => s.counterWithTitle

const mainView = state =>
  h('div', {}, [
    h(Counter,
      {
        counter: state.counter,
        map: mnt(s => s.counter, (s, v) => s.counter = v)
      }
    ),
    h(CounterWithTitle,
      {
        ...CounterWithTitleGetter(state),
        map: mnt(CounterWithTitleGetter, (s, v) => s.counterWithTitle = v)
      }
    )
  ])

app(
  {
    init: initialState,
    node: document.getElementById('app'),
    view: mainView
  }
)
