import { h, app } from 'hyperapp'
import { mnt } from './ha-map'

/// //////////// Counter component ///////////////
const IncrementAction = ({ counter }) => ({ counter: counter + 1 })
const DecrementAction = ({ counter }) => ({ counter: counter - 1 })
const ResetAction = ({ counter }) => ({ counter: 0 })

const Counter = ({ counter }, map, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])

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
  counter: 0,
  counter2: 21,
  counter3: 12,
  counterWithTitle: {
    title: 'Hello Hyperapp!',
    counter: 21
  }
}

const mainView = state =>
  h('div', {}, [
    h(WithMap(Counter, s => ({ counter: s.counter }), (s, v) => s.counter = v.counter), state),
    h(WithMap(CounterWithTitle, s => s.counterWithTitle, (s, v) => s.counterWithTitle = v), state)
  ])

app(
  {
    init: initialState,
    node: document.getElementById('app'),
    view: mainView
  }
)
