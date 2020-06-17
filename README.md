# hyperapp-extra
Repository contains an proposed implementation of the `mnt` function for the hyperapp V2 library. It will enable to decouple actions and implement fully reusable components.

# The gist 
It is assumed that yo ualready familiar with Hyperapp V2 concepts, if not then [read them first](https://hyperapp.dev).

There is only one single `mnt` function that binds together property setter and getter and optional parent mapper. 
This function returns a mapper that can be applied to state or action. This mapper should be pased via props to a component's "view" function. View function should apply a mapper to actions.
Example:

```JavaScript
/////////////// Counter component ///////////////
const IncrementAction = counter => counter + 1
const DecrementAction = counter => counter - 1
const ResetAction = counter => 0

const Counter = ({ counter, map }, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])


...

/////////////// Main View ///////////////
const initialState = {
  counter1: 10,
  counter2: 21
}
...

const view = state =>
  h('div', {}, [
    h(Counter,
      {
        counter: state.counter1,
        map: mnt(s => s.counter1, (s, v) => s.counter1 = v)
      }
    ),
    h(Counter,
      {
        counter: state.counter2,
        map: mnt(s => s.counter2, (s, v) => s.counter2 = v)
      }
    )
  ])
...

```

Here is the [CodePen](https://codepen.io/MotorHeat/pen/pogNEWq).


# Explanation

View doesn't know anything (and should not) about app state. The only thing `view` has is a `props`.
If component need to modify the app state then `view` should use action.
View should map actions from global state to component state.

We can achieve this by 2 steps:
1. Each view should have `map` function that is injected via props
2. View should assign to `vnode` a mapped action rather then action directly. I.e. instead of: `onclick: Increment` it should be `onclick: map(Increment)`.

The proposed `mnt` function is used to construct a such `map` function.
If component also embeds other components that follows above paradigm then parent component should pass own `props.map` as a third parameter to `mnt` function

Below is a small example of how components can be composed to each other. 
`Counter` component 
`Edit` component
`CounterWithTitle` component constructed on top of previous two


```JavaScript
/// //////////// Counter component ///////////////
const IncrementAction = counter => counter + 1
const DecrementAction = counter => counter - 1
const ResetAction = counter => 0

const Counter = ({ counter, map }, children) =>
  h('div', {}, [
    h('h3', {}, counter),
    h('button', { onclick: map(IncrementAction) }, '+'),
    h('button', { onclick: map(DecrementAction) }, '-'),
    h('button', { onclick: map(ResetAction) }, '0'),
    ...children
  ])

/// //////////// Custom edit box. Can edit any string value ///////////////
// model: string
const SetTextAction = (state, text) => text

const Edit = ({ value, map }) =>
  h('input', {
    type: 'text',
    oninput: [
      map(SetTextAction),
      e => e.target.value
    ],
    value: value
  })

// Counter with editable title

const ToggleEditing = state => ({ ...state, editing: !state.editing })

const CounterWithTitle = ({ title, counter, editing, map }) =>
  h('div', {}, [
    !editing && h('p', {}, title),
    editing && h(Edit, { value: title, map: mnt(s => s.title, (s, v) => s.title = v, map) }),
    h(Counter, { counter: counter, map: mnt(s => s.counter, (s, v) => s.counter = v, map) }),
    h('button', { onclick: map(ToggleEditing) }, 'Toggle title edit')
  ])

// Main view

const initialState = {
  counter: 0,
  counterWithTitle: {
    title: 'Hello Hyperapp!',
    counter: 21
  }
}

const CounterWithTitleGetter = s => s.counterWithTitle

const mainView = state =>
  h('div', {}, [
    h(Counter,
      {
        counter: state.counter,
        map: mnt(s => s.counter, (s, v) => s.counter = v)
      }
    ),
    h(CounterWithTitle,
      {
        ...CounterWithTitleGetter(state),
        map: mnt(CounterWithTitleGetter, (s, v) => s.counterWithTitle = v)
      }
    )
  ])

app(
  {
    init: initialState,
    node: document.getElementById('app'),
    view: mainView
  }
)

```

# TypeScript definition
`mnt` function can be described using TypeScript like below. 

```TypeScript
type Action<S> = (state: S, options?: any) => S

type Mapper<X,Y> = ( (s: X) => Y ) 
  & ( (s: X, v: Y) => X ) 
  & ( (action: Action<X>) => Action<Y> );

type Getter<S,U> = (s: S) => U
type Setter<S,U> = (s: S, v: U) => S
type Mount<S,U,G> = ( (get: Getter<S,U>, set: Setter<S,U>, parent: Mapper<G,S>) => Mapper<G,U> )
                  | ( (get: Getter<G,U>, set: Setter<G,U>                     ) => Mapper<G,U> )

// S - is type of current state
// U - is type of state that we want to extract from current and inject to children
// G - type of application global state
// if p is not specified then it is assumed that S is G

declare function mnt<S,U,G> (get: Getter<S,U>, set: Setter<S,U>, parent: Mapper<G,S>): Mapper<G,U>;
declare function mnt<U,G> (get: Getter<G,U>, set: Setter<G,U>): Mapper<G,U>;

```
