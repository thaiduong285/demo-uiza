import React from 'react'
import { Button, Row, Col, Form, FormGroup, Label, Input } from "reactstrap";
import axios from 'axios';

class LiveStreamCreate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
            encode: 0,
            mode: "pull",
            dvr: 0,
            linkStreams: "",
            isNameFieldInvalid: false,
            islinkStreamsFieldInvalid: false
        }
    }

    handleInputOnChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleInputOnBlur = e => {
        if(e.target.name === "name") {
            if(e.target.value.length === 0) {
                this.setState({
                    isNameFieldInvalid: true
                })
            }
            else {
                this.setState({
                    isNameFieldInvalid: false
                })
            }
        }
        else if(e.target.name === "linkStreams") {
            if(e.target.value.length === 0) {
                this.setState({
                    islinkStreamsFieldInvalid: true
                });
            }
            else {
                this.setState({
                    islinkStreamsFieldInvalid: false
                })
            }
        }
    }

    handleSubmitCreateLive = e => {
        e.preventDefault();

        const { name, description, encode, dvr, mode, linkStreams } = this.state;
        if(name.length > 0 && linkStreams.length > 0) {
            this.callCreateLiveStreamApi();
        }
        else {
            this.validateSubmitCreateLiveForm();
        }
    }

    validateSubmitCreateLiveForm = () => {
        const { name, linkStreams } = this.state;

        if(name.length === 0) {
            this.setState({
                isNameFieldInvalid: true
            });
        }
        if(linkStreams.length === 0 ) {
            this.setState({
                islinkStreamsFieldInvalid: true
            })
        }
    }

    callCreateLiveStreamApi = async () => {
        const { name, description, encode, mode, dvr, linkStreams } = this.state;
        const linkStream = linkStreams.split(',');
        const body = {
            name, description, encode, mode, dvr, linkStream, resourceMode: "single"
        }
        const res = await axios.post('/live/entity', body);
        console.log(res);
    }

    render() {
        const { name, description, encode, mode, dvr, linkStreams, isNameFieldInvalid, islinkStreamsFieldInvalid } = this.state;

        return (
            <div className="livestream-create">
                <Form className="live-stream-form" onSubmit={this.handleSubmitCreateLive}>
                    <Row>
                        <Col xs="12" sm="12" md="5" className='form-info'>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="name" className="mr-sm-2">Name*</Label>
                                <Input type="text" name="name" value={name} 
                                    onChange={e => this.handleInputOnChange(e)} invalid={isNameFieldInvalid}
                                    onBlur={e => this.handleInputOnBlur(e)}
                                />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="description" className="mr-sm-2">Description</Label>
                                <Input type="textarea" name="description" value={description} onChange={e => this.handleInputOnChange(e)}/>
                            </FormGroup>
                        </Col>
                        <Col xs="12" sm="12" md="5" className='form-setting'>
                            <legend>Encode</legend>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='encode' value={1} checked={encode} onChange={e => this.handleInputOnChange(e)}/> Yes
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='encode' value={0} checked={!encode} onChange={e => this.handleInputOnChange(e)}/> No
                                </Label>
                            </FormGroup>
                            <legend>Feed type</legend>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='mode' value='pull' checked={mode === "pull"} onChange={e => this.handleInputOnChange(e)}/> Pull
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='mode' value='push' checked={mode === "push"} onChange={e => this.handleInputOnChange(e)}/> Push
                                </Label>
                            </FormGroup>
                            <legend>Record stream</legend>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='dvr' value={1} checked={dvr} onChange={e => this.handleInputOnChange(e)}/> Yes
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='dvr' value={0} checked={!dvr} onChange={e => this.handleInputOnChange(e)}/> No
                                </Label>
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="description" className="mr-sm-2">Link Stream*</Label>
                                <Input type="textarea" name="linkStreams" value={linkStreams} 
                                    onChange={e => this.handleInputOnChange(e)} invalid={islinkStreamsFieldInvalid}
                                    onBlur={e => this.handleInputOnBlur(e)}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button outline color="success" className="submit-form-edit">Submit</Button>
                </Form>
            </div>
        )
    }
}

export default LiveStreamCreate;