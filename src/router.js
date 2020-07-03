import { h } from 'hyperapp'

export const initialRouterState = {
  location: '',
  routes: [],
  current: {
    match: null,
    path: null,
    viewState: null
  },
  notFound: null,
  strict: false
}

const setLocationAction = (state, location) => {
  const result = { ...state }
  result.location = location

  const matched = result.routes
    .map(x => ({ match: matchRoute(x.path, location), route: x }))
    .filter(x => !!x.match)
    .sort((a, b) => b.match.paramsCount - a.match.paramsCount)

  const exact = matched.find(x => x.match.exact)

  if (!matched.length || (!exact && result.strict)) {
    result.current = {
      match: null,
      path: null,
      viewState: null
    }
  } else {
    const c = (exact || matched[0])

    if (c.route.to) {
      result.current = {
        match: {
          exact: c.match.exact,
          params: c.match.params
        },
        path: c.route,
        viewState: c.route.map ? c.route.map(state) : state
      }
    } else {
      // load module
      // TODO: implement module loading
    }
  }

  return result
}

export const RouterView = ({ state, map }) => {
  const routerState = map(state)
  if (routerState.current.match) {
    const { path, viewState, match } = routerState.current
    return path.to(viewState, match, path)
  } else {
    return routerState.notFound && routerState.notFound(state, routerState.location)
  }
}

export const updateRouterStateEffect = (dispatch, { map }) => dispatch(map(setLocationAction), window.location.pathname)

const routerEvent = 'ha-router-event'

const pushHistoryStateEffect = (dispatch, { location }) => {
  history.pushState(location, '', location)
  window.dispatchEvent(new CustomEvent(routerEvent, { detail: location }))
}

const pushHistoryStateAction = (state, newLocation) => [
  state,
  [
    pushHistoryStateEffect,
    {
      location: newLocation
    }
  ]
]

export const RouteLink = ({ to }, children) => h('a', {
  _target: 'blank',
  href: to,
  onclick: [pushHistoryStateAction, e => { e.preventDefault(); e.stopPropagation(); return to }]
},
children)

export const routerLocationSubscription = (dispatch, { map }) => {
  const doRouterEvent = e => dispatch(map(setLocationAction), window.location.pathname)

  window.addEventListener('popstate', doRouterEvent)
  window.addEventListener(routerEvent, doRouterEvent)

  return () => {
    window.removeEventListener(routerEvent, doRouterEvent)
    window.removeEventListener('popstate', doRouterEvent)
  }
}

function matchRoute (route, requestPath) {
  const paramNames = []
  const regexPath = route.replace(/([:*])(\w+)/g, (full, colon, name) => {
    paramNames.push(name)
    return '([^/]+)'
  }) + '(?:/|$)'

  let params = {}
  const routeMatch = requestPath.match(new RegExp(regexPath))
  const exact = routeMatch && routeMatch[0] === requestPath
  if (routeMatch) {
    params = routeMatch.slice(1).reduce((params, value, index) => {
      params[paramNames[index]] = value
      return params
    }, {})
    return {
      route: route,
      path: requestPath,
      params: params,
      exact: exact,
      paramsCount: Object.keys(params).length
    }
  } else {
    return null
  }
}
