import React from "react";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const DropDown = props => {
    const { isOpen, toggle } = props;
    return (    
        <ButtonDropdown isOpen={isOpen} toggle={toggle}>
            <DropdownToggle caret>Select Folder</DropdownToggle>
            <DropdownMenu>
                <DropdownItem header>Header</DropdownItem>
                <DropdownItem disabled>Action</DropdownItem>
                <DropdownItem>Another Action</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>Another Action</DropdownItem>
            </DropdownMenu>
        </ButtonDropdown>
    )
}

export default DropDown