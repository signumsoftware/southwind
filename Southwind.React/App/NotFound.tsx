import * as React from 'react'
import * as AppContext from '@framework/AppContext';

export default class NotFound extends React.Component {

  componentWillMount() {
    if (AppContext.currentUser == null) {
      AppContext.history.replace("~/auth/login", { back: AppContext.history.location });
    }
  }

  render() {
    return (
      <div>
        <h3>404 <small>Not Found</small></h3>
      </div>
    );
  }
}
