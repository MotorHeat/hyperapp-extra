// const SetTextAction = (state, text) => ({ ...state, value: text })

import { h } from '../hyperapp'

export const Edit = ({ value, setValue }) =>
  h('input', {
    type: 'text',
    oninput: [setValue, e => e.target.value],
    value: value
  })
