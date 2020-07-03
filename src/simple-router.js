import { h } from './hyperapp'

export const routerState = {
  location: ''
}

const SetLocationAction = (state, location) => ({ ...state, location })

export function Route (path, to, props) {
  return { path, to, props }
}

export function Switch ({ location, routes }) {
  const matched = routes
    .map(c => ({ match: matchRoute(c.path, location), child: c }))
    .filter(m => !!m.match)
    .sort((a, b) => b.match.paramsCount - a.match.paramsCount)

  const path = matched.find(m => m.match.exact) || matched[0] || null
  return path
    ? h(path.child.to, { ...path.child.props, match: path.match })
    : false
}

export function Link ({ to }) {
  return h('a', {
    _target: 'blank',
    href: to,
    onclick: [SetLocationAction, e => { e.preventDefault(); e.stopPropagation(); return to }]
  })
}

function Test ({ location }) {
  return h(Switch, {
    location: location,
    routes: [
      Route('/users', Users),
      Route('/settings', Settings, { advanced: false })
    ]
  })
}

function matchRoute (path, location) {
  const paramNames = []
  const regexPath = path.replace(/([:*])(\w+)/g, (full, colon, name) => {
    paramNames.push(name)
    return '([^/]+)'
  }) + '(?:/|$)'

  let params = {}
  const routeMatch = location.match(new RegExp(regexPath))
  const exact = routeMatch && routeMatch[0] === location
  if (routeMatch) {
    params = routeMatch.slice(1).reduce((params, value, index) => {
      params[paramNames[index]] = value
      return params
    }, {})
    return {
      path: path,
      location: location,
      params: params,
      exact: exact,
      paramsCount: Object.keys(params).length
    }
  } else {
    return null
  }
}
