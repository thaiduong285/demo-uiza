import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const ModalCreateCategory = props => {
    const { isOpen, className, toggle } = props;

    return (
        <Modal isOpen={isOpen} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle}>Create New Category</ModalHeader>
        <ModalBody>
            a
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={toggle}>Confirm</Button>{' '}
            <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
        </Modal>
    )
}

export default ModalCreateCategory