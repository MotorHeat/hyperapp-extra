import { h, app } from './hyperapp'
import { RouteLink, RouterView, routerLocationSubscription, initialRouterState, updateRouterStateEffect } from './router'
import { mnt } from './ha-map'

const Home = (state, match) =>
  h('div', {}, [
    h('h1', {}, 'Home page'),
    h(RouteLink, { to: '/users' }, 'Go to users'),
    h(RouteLink, { to: '/users/123' }, 'Wrong link')
  ])

const Users = (state, match) =>
  h('div', {}, [
    h('h1', {}, 'Users page'),
    h('p', {}, 'Hi! How are you? :)'),
    h(RouteLink, { to: '/' }, 'Go to home'),
    h(RouteLink, { to: '/users/24' }, 'Go to user 24')
  ])

const User = (state, match) => h('p', {}, match.params.id)

const notFound = (state, location) =>
  h('div', {}, [
    h('h1', {}, 'Page not found'),
    h('p', {}, `Page at location ${location} not found.`),
    h(RouteLink, { to: '/' }, 'Go to home page')
  ])

const routerMapper = mnt(s => s.router, (s, v) => s.router = v)

const mainView = (state) =>
  h('div', {}, [
    h(RouterView,
      {
        state: state,
        map: routerMapper
      })
  ])

const initialState = {
  router: {
    ...initialRouterState,
    routes: [
      { path: '/', to: Home },
      { path: '/users', to: Users },
      { path: '/users/:id', to: User }
    ],
    notFound: notFound
  }
}

const node = document.getElementById('app')

app(
  {
    init: [
      initialState,
      [
        updateRouterStateEffect,
        {
          map: routerMapper
        }
      ]
    ],
    node: node,
    view: mainView,
    subscriptions: state => [
      routerLocationSubscription, {
        map: routerMapper
      }
    ]
  }
)

import('./i10n').then(m => {
  console.log(m)
})
