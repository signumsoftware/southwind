import * as React from 'react'
import * as Navigator from "@framework/Navigator"

export default class NotFound extends React.Component {

  componentWillMount() {
    if (Navigator.currentUser == null) {
      Navigator.history.replace("~/auth/login", { back: Navigator.history.location });
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
