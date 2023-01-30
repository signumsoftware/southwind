import * as React from 'react'
import * as AppContext from '@framework/AppContext';

export default function NotFound() {

  React.useEffect(() => {
    if (AppContext.currentUser == null) {
      AppContext.navigate("/auth/login", { state: { back: AppContext.location() }, replace: true });
    }
  }, []);

  return (
    <div>
      <h3>404 <small>Not Found</small></h3>
    </div>
  );
}
