// type RouteView<T> = (state: T, match: RouteMatch, path: Path<T>) => any;
// type NotFoundRouteView = (state: any, location: string) => any

// interface Path<T> {
//   readonly path: string
//   readonly to: RouteView<T>
//   readonly load: {url: string, name: string}
//   readonly map: Mapper<any,T> 
// }

// interface RouteMatch {
//   readonly params: any;
//   readonly exact: boolean
// }

// interface CurrentMatch<T> {
//   path: Path<T>
//   match: RouteMatch
//   viewState: T
// }

// interface RouterState {
//     location: string
//     routes: Path<any>[]
//     current: CurrentMatch<any>
//     notFound: NotFoundRouteView
//     strict: boolean
// }
