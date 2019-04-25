import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const ModalConfirm = props => {
    const { isOpen, toggle, className, children, confirmAction, modalHeader } = props;
    return (
        <div>
            <Modal isOpen={isOpen} toggle={toggle} className={className}>
            <ModalHeader toggle={toggle}>{modalHeader}</ModalHeader>
            <ModalBody>
                {children}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={confirmAction}>Confirm</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
            </Modal>
      </div>
    )
}

export default ModalConfirm