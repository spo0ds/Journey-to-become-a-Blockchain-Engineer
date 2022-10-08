import { convertRoutesToDataRoutes } from "./utils";
export type { ActionFunction, ActionFunctionArgs, AgnosticDataRouteMatch, AgnosticDataRouteObject, AgnosticRouteMatch, AgnosticRouteObject, TrackedPromise, FormEncType, FormMethod, JsonFunction, LoaderFunction, LoaderFunctionArgs, ParamParseKey, Params, PathMatch, PathPattern, RedirectFunction, ShouldRevalidateFunction, Submission, } from "./utils";
export { AbortedDeferredError, ErrorResponse, defer, generatePath, getToPathname, invariant, isRouteErrorResponse, joinPaths, json, matchPath, matchRoutes, normalizePathname, redirect, resolvePath, resolveTo, stripBasename, warning, } from "./utils";
export type { BrowserHistory, BrowserHistoryOptions, HashHistory, HashHistoryOptions, History, InitialEntry, Location, MemoryHistory, MemoryHistoryOptions, Path, To, } from "./history";
export { Action, createBrowserHistory, createPath, createHashHistory, createMemoryHistory, parsePath, } from "./history";
export * from "./router";
/** @internal */
export { convertRoutesToDataRoutes as UNSAFE_convertRoutesToDataRoutes };
