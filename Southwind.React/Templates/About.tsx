/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'
import {Modal, Popover, Tooltip, Button, OverlayTrigger} from 'react-bootstrap'
import {openPopup} from "Framework/Signum.React/Scripts/Modals"

export default class About extends React.Component<{}, {}> {

    constructor() {
        super({});
        this.state = { modals: [] };
    }
    
    handleClick() {
        openPopup(<Modal onHide={null}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
          <Modal.Body>


            <h4>Overflowing text to show scroll behavior</h4>
            <p>Cras mattis consectetur purus sit amet fermentum.Cras justo odio, dapibus ac facilisis in, egestas eget quam.Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>

                           <Button onClick={() => this.handleClick() }>
                               Open Modal
                               </Button>
              </Modal.Body>
            </Modal>);
    }

    render() {
        return (
            <div>
        <p>Click to get the full Modal experience!</p>

        <Button
            bsStyle="primary"
            bsSize="large"
            onClick={() => this.handleClick() }
            >
            Launch demo modal
            </Button>
            </div>
        );
    }
}
