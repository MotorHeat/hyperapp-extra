let currentLanguage = {}

export function t (s, params) {
  const props = s.split('.')
  let value = props.reduce((state, prop) => state ? state[prop] : null, currentLanguage)
  if (!!value && !!params) {
    value = Object.keys(params).reduce((prev, prop) => prev.replace(new RegExp('\\{' + prop + '\\}', 'g'), params[prop]), value)
  }
  return value || s
}

function i10nSetCurrentLanguageAction (state, options) {
  const p = options.props()
  currentLanguage = options.strings
  return options.props({ ...p, current: options.strings })
}

export function i10nSetCurrentLanguageEffect (dispatch, options) {
  dispatch(i10nSetCurrentLanguageAction, { props: options.props, strings: options.strings })
}
