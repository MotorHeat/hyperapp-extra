import { app, h } from 'hyperapp'
import { mnt } from './ha-map'

// Context hof is simple as
const withContext = componentView => (attrs, children) => {
  const hh = (name, props, children) =>
    typeof name === 'function'
      ? h(withContext(name), { ...attrs, ...props }, children)
      : h(name, props, children)

  return componentView(attrs, children, hh)
}

const sumAction = (state, p) => state + p

const Counter = ({ counter, l, map }, children, h) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', {
      onclick: [map(sumAction), 1]
    },
    l['lib.counter.plus']),
    h('button', {
      onclick: [map(sumAction), -1]
    },
    l['lib.counter.minus'])
  ])

const setTextAction = (state, text) => text

const TextEdit = ({ value, map }, children, h) =>
  h('input', {
    value: value,
    oninput: [map(setTextAction), e => e.target.value]
  })

const runActionEffect = (dispatch, action) => {
  action && dispatch(action)
}

const commitTextAction = (state, { callback }) => [
  {
    ...state,
    value: typeof (state.editingValue) === 'undefined' ? state.value : state.editingValue,
    editingValue: undefined
  },
  [runActionEffect, callback]
]

const setEditingText = (state, text) => ({ ...state, editingValue: text })
const cancelTextAction = (state, { callback }) => [
  { ...state, editingValue: state.value },
  [runActionEffect, callback]
]

const CommitEdit = ({ value, editingValue, onCommit, onCancel, map }) =>
  h('div', {}, [
    h('input', {
      value: typeof (editingValue) === 'undefined' ? value : editingValue,
      oninput: [map(setEditingText), e => e.target.value]
    }),
    h('button', { onclick: [map(commitTextAction), { callback: onCommit }] }, 'OK'),
    h('button', { onclick: [map(cancelTextAction), { callback: onCancel }] }, 'Cancel')
  ])

const commitEditGetter = s => ({ value: s.title, editingValue: s.editingValue })
const commitEditSetter = (s, v) => {
  s.title = v.value
  s.editingValue = v.editingValue
}

const toggleEditing = (state) => {
  console.log(state)
  return ({ ...state, editing: !state.editing })
}
const TitledCounter = (props, children, h) => {
  const { counter, title, editing, map } = props
  return h('div', {}, [
    !editing && h('h3', {}, title),
    editing && h(CommitEdit, {
      ...commitEditGetter(props),
      onCommit: map(toggleEditing),
      onCancel: map(toggleEditing),
      map: mnt(commitEditGetter, commitEditSetter, map)
    }),
    h(Counter, {
      counter: counter,
      map: mnt(s => s.counter, (s, v) => s.counter = v, map)
    }),
    h('button', { onclick: map(toggleEditing) }, 'Toggle edit')
  ])
}

// function WithMap (props, getter, setter) {
//   const map = mnt(getter, setter, (props && props.map) || null)
//   const mappedProps = { ...props, map }
//   return mappedProps
// }

const toggleLanguage = state => ({ ...state, l: state.l === en ? ru : en })

const viewWithMappedComponent = (props, childs, h) => h('div', {}, [
  h('h1', {}, props.titledCounter.title),
  h('button', { onclick: toggleLanguage }, props.l['app.main.toggle-language']),
  h(TitledCounter,
    {
      title: props.titledCounter.title,
      counter: props.titledCounter.counter,
      editing: props.titledCounter.editing,
      editingValue: props.titledCounter.editingValue,
      map: mnt(s => s.titledCounter, (s, v) => s.titledCounter = v)
    })
])

const en = {
  'lib.counter.plus': 'Plus',
  'lib.counter.minus': 'Minus',
  'app.main.toggle-language': 'Toggle language'
}

const ru = {
  'lib.counter.plus': 'Плюс',
  'lib.counter.minus': 'Минус',
  'app.main.toggle-language': 'Переключить язык'
}

app({
  init: {
    state: 1,
    counter: 21,
    l: en,
    svc: {
      translate: s => s
    },
    titledCounter: {
      title: 'Hello world!',
      counter: 33,
      editing: true
    }
  },
  // wrapping view with context
  // view: withContext(view),
  view: withContext(viewWithMappedComponent),
  node: document.body
})
