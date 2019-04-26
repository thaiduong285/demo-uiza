import React from "react";
import axios from "axios";
import { Button, Form, FormGroup, FormText, Label, Input, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from "classnames";

import "./EntityCreate.css";

class EntityCreate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entityFile: null,
            entityUrl: "",
            name: "",
            description: "",
            activeTab: '1',
            isNameFieldInvalid: false,
            isUrlFieldInvalid: false,
            listOfNewEntities: []
        }
    }

    toggleTab = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    handleOnChangeInputFile = e => {
        console.log(e.target.files);
        this.setState({
            entityFile: e.target.files
        });
    }

    handleOnChangeInputText = e => {
        this.setState({
            [e.target.name]: e.target.value
        });

        if(e.target.name === "name") {
            let isNameFieldInvalid = e.target.value.length === 0 ? true : false;
            this.setState({ isNameFieldInvalid });
        }
        if(e.target.name === "entityUrl") {
            let isUrlFieldInvalid = e.target.value.length === 0 ? true : false;
            this.setState({ isUrlFieldInvalid });
        }
    }

    handleUploadEntity = async e => {
        e.preventDefault();
        try {
            let awsRes = await axios.get("/admin/app/config/aws");
            console.log("aws", awsRes);
            let { code } = awsRes.data;
            if (code === 200) {
                const { entityFile } = this.state;

                let newEntity = {
                    name: entityFile[0].name,
                    url: `s3+uiza+${entityFile[0].name}`,
                    inputType: "s3"
                }

                // axios.post("/media/entity", newEntity);
            }
        }
        catch (err) {
            throw new Error(err);
        }
    }

    validateInputField = () => {
        const { name, entityUrl } = this.state;

        let isNameFieldInvalid = name.length === 0 ? true : false;
        let isUrlFieldInvalid = entityUrl.length === 0 ? true : false;

        this.setState({ isNameFieldInvalid, isUrlFieldInvalid });
    }

    handleSubmitCreateEntity = async e => {
        e.preventDefault();
        const { entityUrl, name, description } = this.state;

        if(entityUrl.length > 0 && name.length > 0) {
            let newEntity = {
                name: name,
                url: entityUrl,
                inputType: "http",
                description: description ? description : ""
            }
            
            try {
                let res = await axios.post("/media/entity", newEntity);
                let { code, data } = res.data;

                if(code === 200) {
                    let { listOfNewEntities } = this.state;
                    listOfNewEntities.push(data);
                    this.setState({ 
                        listOfNewEntities,
                        name: "",
                        entityUrl: "",
                        description: ""
                    });
                }
            }
            catch(err) {
                throw new Error(err);
            }
        }
        else {
            this.validateInputField();
        }
    }

    showTableOfNewEntities = () => {
        const { listOfNewEntities } = this.state;

        return (
            <table>
                <thead>
                    <tr>
                        <td>name</td>
                        <td>type</td>
                        <td>url</td>
                        <td>inputType</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        listOfNewEntities.map((entity, index) => {
                            console.log(entity);
                            return (
                                <tr key={index}>
                                    <td>{entity.name}</td>
                                    <td>{entity.type}</td>
                                    <td>{entity.url}</td>
                                    <td>{entity.inputType}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    render() {
        const { isNameFieldInvalid, isUrlFieldInvalid, name, entityUrl, description } = this.state;

        return (
            <div data-test="entityCreate" className="entity-create-form">
                <Input type="text" className="inputtest" />
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '1' })}
                            onClick={() => { this.toggleTab('1'); }}
                        >
                            File
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '2' })}
                            onClick={() => { this.toggleTab('2'); }}
                        >
                            URL
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        <Form onSubmit={e => this.handleUploadEntity(e)}>
                            <FormGroup>
                                <Label for="exampleFile">File</Label>
                                <Input type="file" name="file" id="exampleFile" onChange={e => this.handleOnChangeInputFile(e)} multiple />
                                <FormText color="muted">
                                    This is some placeholder block-level help text for the above input.
                                    It's a bit lighter and easily wraps to a new line.
                                </FormText>
                            </FormGroup>
                            <Button>Submit</Button>
                        </Form>
                    </TabPane>
                    <TabPane tabId="2">
                        <Form onSubmit={e => this.handleSubmitCreateEntity(e)} className="form-create-entity-url">
                            <FormGroup className="mb-2 mr-sm-8 mb-sm-0 row">
                                <Label for="exampleEmail" className="mr-sm-2">URL</Label>
                                <Input type="text" name="entityUrl" invalid={isUrlFieldInvalid} value={entityUrl}
                                    data-test="input-url" data-invalid={isUrlFieldInvalid}
                                    placeholder="https://www.youtube.com/watch?v=vx9CSpnROfs" onChange={e => this.handleOnChangeInputText(e)}
                                />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="name" className="mr-sm-2">Name*</Label>
                                <Input type="text" name="name" invalid={isNameFieldInvalid}
                                    data-test="input-name" data-invalid={isNameFieldInvalid}
                                    value={name}
                                    onChange={e => this.handleOnChangeInputText(e)}
                                />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="description" className="mr-sm-2">Description</Label>
                                <Input type="textarea" name="description"
                                    value={description}
                                    onChange={e => this.handleOnChangeInputText(e)}/>
                            </FormGroup>
                            <Button data-test="submit-create-entity">Submit</Button>
                        </Form>
                        <div className="entity-table">
                            { this.showTableOfNewEntities() }
                        </div>
                    </TabPane>
                </TabContent>
            </div>
        )
    }
}

export default EntityCreate;