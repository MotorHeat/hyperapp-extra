import { h } from '../hyperapp'
export const counterInit = { counter: 0 }

export function NewCounter (counter) {
  return { counter }
}

const IncrementAction = ({ counter }) => ({ counter: counter + 1 })
const DecrementAction = ({ counter }) => ({ counter: counter - 1 })
const ResetAction = ({ counter }) => ({ counter: 0 })

export const Counter = ({ counter }, map, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])
