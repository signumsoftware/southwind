/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'
import {Modal, Popover, Tooltip, Button, OverlayTrigger} from 'react-bootstrap'
import {openModal, IModalProps} from "Framework/Signum.React/Scripts/Modals"



export default class About extends React.Component<{}, { str: string }> {

    constructor(props) {
        super(props);
        this.state = { str: "hola" };
    }

    //handleOnExited = () => {
    //    this.state.modals.pop();
    //    console.log(this.state.modals.length);
    //    this.forceUpdate();
    //};

    handleClick = () => {
        openModal(<ModalTest onClick={this.handleClick} />).then(val=> {
            this.setState({ str: this.state.str + " " + val });
        });

        //this.state.modals.push();
        //console.log(this.state.modals.length);
        //this.forceUpdate();
    }

    render() {
        return (
            <div>
        <p>Click to get the full Modal experience!</p>

        <Button
            bsStyle="primary"
            bsSize="large"
            onClick={this.handleClick }
                    >
                    Launch demo modal {this.state.str}
            </Button>
                </div>
        );
    }
}

export class ModalTest extends React.Component<{ onExited?: (val: string) => void, onClick: () => void }, { shown: boolean }>{

    constructor(props) {
        super(props);
        this.state = { shown: true };
    }

    onHide = () => {
        this.setState({ shown: false });
    }

    render() {
        return <Modal
            onHide={this.onHide}
            show={this.state.shown}
            onExited={()=>this.props.onExited("hi")}
            >
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
          <Modal.Body>


            <h4>Overflowing text to show scroll behavior</h4>
            <p>Cras mattis consectetur purus sit amet fermentum.Cras justo odio, dapibus ac facilisis in, egestas eget quam.Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
                        <Button
                            bsStyle="primary"
                            bsSize="large"
                            onClick={this.props.onClick}
                            >
                            Launch demo modal
                            </Button>


              </Modal.Body>
            </Modal>;
    }
}
