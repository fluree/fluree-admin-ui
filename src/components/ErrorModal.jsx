import React from "react";
import { Button, Modal } from "react-bootstrap";

class ErrorModal extends React.Component {
  render() {
    const error = this.props.error;
    const errType = error.error;
    const message =
      error.message || error.error || "No Message Provided with Error.";

    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Error processing action ({error.status})</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {errType ? <p>Error type: {errType}</p> : null}
            <p>{message}</p>
            <p>{JSON.stringify(error)}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.props.dismiss}>
              Dismiss
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    );
  }
}

export default ErrorModal;
