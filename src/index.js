import { take, cancel, fork } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { matchPath } from "react-router-dom";
import find from "lodash.find";

function* sagaRouter(history, routes) {
  const channel = eventChannel(emit =>
    history.listen(location => emit(location))
  );
  let match = find(routes, route => matchPath(history.location.pathname, route));
  let taskFromRoute = match ? yield fork(match.saga) : null;
  let previousMatch = match ? match : null;
  while (true) {
    const location = yield take(channel);
    match = find(routes, route => matchPath(location.pathname, route));
    if (match && match !== previousMatch) {
      if (taskFromRoute && taskFromRoute.isRunning()) {
        yield cancel(taskFromRoute);
      }
      taskFromRoute = yield fork(match.saga);
      previousMatch = match;
    }
  }
}

export default sagaRouter;
