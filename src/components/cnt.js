import { h } from '../hyperapp'
import { Delay } from 'hyperapp-fx/src'

const IncAction = state => ({ ...state, counter: state.counter + 1 })
const DecAction = state => ({ ...state, counter: state.counter - 1 })
const DelayedInc = state => [
  state,
  Delay({
    wait: 1000,
    action: IncAction
  })
]

const CheckMaxAction = state => {
  return { ...state, counter: state.counter > 50 ? 50 : state.counter }
}

export const Cnt = ({ counter }, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: IncAction }, '+'),
    h('button', { onclick: DecAction }, '-'),
    h('button', { onclick: DelayedInc }, '+ (delayed)'),
    ...children
  ])

function reapeatActionSubscription (dispatch, opts) {
  const i = setInterval(() => {
    dispatch(opts.action, opts.args)
  }, opts.interval)
  return function () {
    clearInterval(i)
  }
}

export const CounterSubs = (state, mappers) => {
  return [
    [
      reapeatActionSubscription,
      {
        interval: 1000,
        action: CheckMaxAction,
        opts: 10
      },
      mappers
    ]
  ]
}
