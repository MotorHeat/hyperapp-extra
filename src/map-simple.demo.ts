import { h, app } from 'hyperapp'
import { mnt } from './ha-map'

interface VNode {
  name: string
  props: any
  children: VNode | VNode[]
  node: any
  type: any,
  key: any
}

interface CounterState {
  counter: number
}

type ComponentAction<T, P = {}> = (state: T, p?: P) => T
type ComponentView<T> = (state: T, map: Mapper<any, T>, children?: any) => VNode | VNode[] | false | null | undefined

/// //////////// Counter component ///////////////
const IncrementAction: ComponentAction<CounterState> = state => ({ ...state, counter: state.counter + 1 })
const DecrementAction: ComponentAction<CounterState> = state => ({ ...state, counter: state.counter - 1 })
const ResetAction: ComponentAction<CounterState> = state => ({ ...state, counter: 0 })

const Counter: ComponentView<CounterState> = ({ counter }, map, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])

/// //////////// Custom edit box. Can edit any string value ///////////////

interface EditState {
  value: string
}

const SetTextAction: ComponentAction<EditState, string> = (state, text) => ({ ...state, value: text })

const Edit: ComponentView<EditState> = ({ value }, map) =>
  h('input', {
    type: 'text',
    oninput: [map(SetTextAction), e => e.target.value],
    value: value
  })

// view = (state, map, children)
// const WithMap = (view, getter, setter, parentMap) => {
//   const map = mnt(getter, setter, parentMap)
//   return (state, children) => view(getter(state), map, children)
// }

function WithMap<S, U> (view: ComponentView<U>, getter: Getter<S, U>, setter: Setter<S, U>, parentMap?: Mapper<any, S>) {
  const map: Mapper<S, U> = mnt(getter, setter, parentMap)
  return (state: S, children) => view(getter(state), map, children)
}

function Map<S, U> (view: ComponentView<U>, getter: Getter<S, U>, setter: Setter<S, U>, parentMap?: Mapper<any, S>, state: S, children?: any) {
  return h(WithMap(view, getter, setter, parentMap), state, children)
}

// Counter with editable title
interface CounterWithTitleState {
  title: string
  counter: number
  editing?: boolean
}

const ToggleEditing: ComponentAction<CounterWithTitleState> = state => ({ ...state, editing: !state.editing })

const CounterWithTitle: ComponentView<CounterWithTitleState> = (state, map) => {
  const { title, counter, editing } = state
  const MappedEdit = WithMap<CounterWithTitleState, EditState>(Edit, s => ({ value: s.title }), (s, v) => s.title = v.value, map)

  return h('div', {}, [
    !editing && h('p', {}, title),
    editing && h(MappedEdit, state),
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

type AppState = typeof initialState

const mainView = state =>
  h('div', {}, [
    h(WithMap<AppState, CounterState>(Counter, s => ({ counter: s.counter }), (s, v) => s.counter = v.counter), state),
    Map<AppState, CounterState>(Counter, s => ({ counter: s.counter }), (s, v) => s.counter = v.counter)(state),
    Map(Counter, s => ({ counter: s.counter }), (s, v) => s.counter = v.counter, state),
    h(WithMap<AppState, CounterWithTitleState>(CounterWithTitle, s => s.counterWithTitle, (s, v) => s.counterWithTitle = v), state)
  ])

app(
  {
    init: initialState,
    node: document.getElementById('app'),
    view: mainView
  }
)
