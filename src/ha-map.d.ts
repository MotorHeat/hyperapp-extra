type Action<S> = (state: S, options?: any) => S

type Mapper<X,Y> = ( (s: X) => Y ) 
  & ( (s: X, v: Y) => X ) 
  & ( (action: Action<X>) => Action<Y> );

type Getter<S,U> = (s: S) => U
type Setter<S,U> = (s: S, v: U) => void
type Mount<S,U,G> = ( (get: Getter<S,U>, set: Setter<S,U>, parent: Mapper<G,S>) => Mapper<G,U> )
                  | ( (get: Getter<G,U>, set: Setter<G,U>                     ) => Mapper<G,U> )

// S - is type of current state
// U - is type of state that we want to extract from current and inject to children
// G - type of application global state
// if p is not specified then it is assumed that S is G

declare function mnt<S,U,G> (get: Getter<S,U>, set: Setter<S,U>, parent: Mapper<G,S>): Mapper<G,U>;
declare function mnt<U,G> (get: Getter<G,U>, set: Setter<G,U>): Mapper<G,U>;

