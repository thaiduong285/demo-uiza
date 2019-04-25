import React from "react";
import axios from "axios";
import { Button, Form, FormGroup, Label, Input, Progress } from "reactstrap";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import ModalConfirm from "../ModalConfirm/ModalConfirm";
import "./EntityDetail.css";

library.add(faEdit);

class EntityDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: null,
            isUserEditting: false,
            isEntityPublished: true,
            name: "",
            description: "",
            isInputNameInvalid: false,
            isModalConfirmPublishOpened: false,
            modalConfirmNote: "",
            publishProgress: 0,
            showPublishProgress: false
        }
    }

    componentDidMount() {
        this.initializeUizaPlayer();
        this.retreiveAnEntity();
    }

    retreiveAnEntity = async () => {
        const { id: entityId } = this.props.match.params;
        const res = await axios.get(`/media/entity?id=${entityId}`);
        const { data } = res.data;

        this.setState({ 
            entity: data,
            isEntityPublished: data.publishToCdn === "success" ? true : false,
            name: data.name,
            description: data.description
        });
    }

    initializeUizaPlayer = () => {
        const { id: entityId } = this.props.match.params;
        const UizaPlayerSDK = window.UizaPlayerSDK;
        UizaPlayerSDK.Player.init(
            '#player',
            {
              api: btoa('ap-southeast-1-api.uiza.co'),
              appId: '098b45c5d7c046c0bf6cd16389486c4b',
              playerVersion: 4,
              entityId: entityId,
              width: '100%',
              height: '400px',
            },
            function(player) {
              // 4. You can add logo at here
              // 5. You can add event listeners at here
              player.on('play');
              player.on('pause');
            }
        );
    }

    showVideoNameAndView = () => {
        const { entity } = this.state;

        if(entity) {
            return (
                <div className="video-player-detail">
                    <h2>{entity.name}</h2>
                    <p>{entity.view}</p>
                </div>
            )
        }
    }

    changeDateFormat = date => {
        date = new Date(date);
        let stringDate = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
        let stringTime = [date.getHours(), date.getMinutes(), date.getSeconds()].join(":");

        return `${stringDate} ${stringTime}`;
    }

    showEntityDetail = () => {
        const { entity } = this.state;

        if(entity) {
            return (
                <table>
                    <tbody>
                        <tr>
                            <td>ID</td>
                            <td>{entity.id}</td>
                        </tr>
                        <tr>
                            <td>Create at</td>
                            <td>{this.changeDateFormat(entity.createdAt)}</td>
                        </tr>
                        <tr>
                            <td>Update at</td>
                            <td>{this.changeDateFormat(entity.updatedAt)}</td>
                        </tr>
                        <tr>
                            <td>Description</td>
                            <td>{entity.description}</td>
                        </tr>
                        <tr>
                            <td>Type</td>
                            <td>{entity.type}</td>
                        </tr>
                    </tbody>
                </table>
            )
        }
    }

    showPublishProgressBar = () => {
        const { publishProgress } = this.state;
        return (
            <Progress value={publishProgress} max="100" />
        )
    }

    handleEditEntityFormSubmit = async event => {
        event.preventDefault();
        const { entity, name, description } = this.state;
        console.log("submit");
        let formEditData = {
            ...entity,
            name,
            description
        };
        if(name.length > 0){
            try {
                let res = await axios.put(`/media/entity`, formEditData);
                if(res.data.code === 200) {
                    this.setState({
                        entity: formEditData
                    })
                }
                this.toggleFormEditEntity();
            }
            catch(err) {
                throw new Error(err);
            }
        }
        else {
            console.log("Input all required fields");
        }
    }

    showEntityFormEditDetail = () => {
        const { entity, isInputNameInvalid } = this.state;
        if(entity) {
            return (
                <Form className="entity-form-detail" onSubmit={this.handleEditEntityFormSubmit}>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0" row>
                        <Label for="enityId" className="mr-sm-2">ID</Label>
                        <Input type="text" name="id" value={entity.id} disabled/>
                    </FormGroup>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                        <Label for="createdAt" className="mr-sm-2">Created At</Label>
                        <Input type="datetime" name="createdAt" value={this.changeDateFormat(entity.createdAt)} disabled/>
                    </FormGroup>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                        <Label for="updatedAt" className="mr-sm-2">Updated At</Label>
                        <Input type="datetime" name="updatedAt" value={this.changeDateFormat(entity.updatedAt)} disabled/>
                    </FormGroup>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                        <Label for="name" className="mr-sm-2">Name*</Label>
                        <Input type="text" name="name" defaultValue={entity.name} onChange={e => this.handleInputOnChange(e) } invalid={isInputNameInvalid}/>
                    </FormGroup>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                        <Label for="description" className="mr-sm-2">Description</Label>
                        <Input type="textarea" name="description" defaultValue={entity.description ? entity.description : ""}
                        onChange={e => this.handleInputOnChange(e)}/>
                    </FormGroup>
                    <Button outline color="success" className="submit-form-edit">Submit</Button>
                </Form>
            )
        }
    }

    toggleFormEditEntity = () => {
        const { isUserEditting } = this.state;

        this.setState({ isUserEditting: !this.state.isUserEditting });
    }

    callPublishEntityApi = async () => {
        const { entity, isEntityPublished } = this.state;
        if(!isEntityPublished) {
            if(entity) {
                let entityId = entity.id;

                try {
                    let res = await axios.post("/media/entity/publish", { id: entityId });
                    let { code } = res.data;

                    if(code === 200) {
                        this.setState({ showPublishProgress: true });
                        this.watchPublishProgress(entityId);
                    }
                }
                catch(err) {
                    throw new Error(err);
                }
            }
        }
        else {
            console.log("entity is published");
        }
    }

    watchPublishProgress = entityId => {
        let intervalProgress = setInterval(async () => {
            try {
                let res = await axios.get(`/media/entity/publish/status?id=${entityId}`);
                let { code, data } = res.data;

                if(code === 200) {
                    if(data.progress === 100) {
                        this.setState({ isModalConfirmPublishOpened: false });
                        this.retreiveAnEntity();
                        clearInterval(intervalProgress);
                    }

                    this.setState({
                        publishProgress: data.progress
                    });
                }
            }
            catch(err) {
                throw new Error(err);
            }
        }, 5000)
    }

    handleInputOnChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });

        if(event.target.name === "name") {
            if(event.target.value.length === 0) {
                this.setState({ isInputNameInvalid: true });
            }
            else {
                this.setState({ isInputNameInvalid: false });
            }
        }
    }

    toggleModalPublishConfirmation = () => {
        if(!this.state.isEntityPublished) {
            this.setState({
                isModalConfirmPublishOpened: !this.state.isModalConfirmPublishOpened,
                modalConfirmNote: "Do you want to publish the entity?"
            });
        }
        else {
            console.log("entity is published");
        }
    }

    render() {
        const { entity, isUserEditting, isEntityPublished, isModalConfirmPublishOpened, modalConfirmNote, showPublishProgress } = this.state;
        let playerHidden = false;

        if(entity && !isEntityPublished) {
            playerHidden = true;
        }
        
        return (
            <>
                <div className="entity-detail">
                    <div className="entity-player">
                        <div id="player" hidden={playerHidden}></div>
                        <div hidden={!playerHidden} className="not-published-entity-img"></div>
                        { this.showVideoNameAndView() }
                    </div>
                    <div className="control-panel">
                        <Button color="info" onClick={this.toggleModalPublishConfirmation}>Publish</Button>
                        <Button color="danger">Delete</Button>
                    </div>
                    <div className="detail">
                        <div className="entity-info">
                            <div className="entity-detail-header">
                                <h3>Entity's Information</h3>
                                <Button outline color="info" onClick={this.toggleFormEditEntity}>{ isUserEditting ? "Cancel" : <FontAwesomeIcon icon={faEdit}/>}{' '}Edit</Button>
                            </div>
                            { isUserEditting ? this.showEntityFormEditDetail() : this.showEntityDetail() }
                        </div>
                    </div>
                </div>
                <ModalConfirm isOpen={isModalConfirmPublishOpened} toggle={this.toggleModalPublishConfirmation} confirmAction={this.callPublishEntityApi} modalHeader="Delete Confirmation">
                    { showPublishProgress ? this.showPublishProgressBar() : modalConfirmNote }
                </ModalConfirm>
            </>
        )
    }
}

export default EntityDetail;