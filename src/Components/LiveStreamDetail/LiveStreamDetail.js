import React from "react";
import axios from "axios";
import { Button, Row, Col, Form, FormGroup, Label, Input, legend } from "reactstrap";

import "./LiveStreamDetail.css";

class LiveStreamDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveStream: null,
            isStreaming: false,
            isConfigStream: false
        }
    }

    componentDidMount() {
        this.initUizaLiveStream();
    }

    retreiveLiveStream = async () => {
        return new Promise(async (resolve, reject) => {
            const { params } = this.props.match;
            let { isStreaming } = this.state;
            try {
                let res = await axios.get(`/live/entity?id=${params.id}`);
                let { code, data } = res.data;
                console.log(data);
                if (code === 200) {
                    isStreaming = data.lastProcess === "start" ? true : false;
                    this.setState({
                        liveStream: data,
                        isStreaming
                    });
                    resolve(data);
                }
            }
            catch (err) {
                reject(err);
                throw new Error(err);
            }
        });
    }

    initUizaLiveStream = async () => {
        const UZ = window.UizaPlayerSDK;
        try {
            const liveStream = await this.retreiveLiveStream();
            let playerElement = document.getElementById("player");
            playerElement.innerHTML = "";
            UZ.Player.init(
                '#player',
                {
                    api: btoa('ap-southeast-1-api.uiza.co'),
                    appId: '700c91ac20334eb38642032d69783c45',
                    playerVersion: 4,
                    entityId: liveStream.id,
                    streamName: liveStream.channelName,
                    feedId: liveStream.lastFeedId,
                    region: "ap-southeast-1",
                    width: '100%',
                    height: '400px',
                },
                function (player) {
                    player.on('play');
                    player.on('pause');
                }
            );
        }
        catch (err) {
            throw new Error(err);
        }
    }

    handleStartStopStream = lastProcess => {
        switch (lastProcess) {
            case "stop":
                this.callStartStreamApi();
                break;
            case "start":
                this.callStopStreamApi();
                break;
            default:
                return null;
        }
    }

    callStartStreamApi = async () => {
        const { liveStream } = this.state;
        if (liveStream) {
            const { id, lastProcess } = liveStream;
            try {
                let res = await axios.post(`/live/entity/feed?id=${id}`);
                let { code, data } = res.data;

                if (code === 200) {
                    console.log(data.message);
                    this.IntervalRequestLiveStreamChange(lastProcess);
                }
            }
            catch (err) {
                throw new Error(err);
            }
        }
    }

    callStopStreamApi = async () => {
        const { liveStream } = this.state;
        if (liveStream) {
            const { id, lastProcess } = liveStream;
            try {
                let res = await axios.put(`/live/entity/feed?id=${id}`);
                let { code, data } = res.data;

                if (code === 200) {
                    console.log(data.message);
                    this.IntervalRequestLiveStreamChange(lastProcess);
                }
            }
            catch (err) {
                throw new Error(err);
            }
        }
    }

    IntervalRequestLiveStreamChange = lastProcess => {
        let getStreamInterval = setInterval(async () => {

            const res = await this.retreiveLiveStream();

            if (lastProcess === "start") {

                if (res.lastProcess === "stop") {
                    let playerElement = document.getElementById("player");
                    playerElement.innerHTML = "";
                    clearInterval(getStreamInterval);
                }
            }
            else if (lastProcess === "stop") {

                if (res.lastProcess === "start") {
                    this.initUizaLiveStream();
                    clearInterval(getStreamInterval);
                }
            }
        }, 2000);
    }

    showLiveStreamBtn = () => {
        const { liveStream } = this.state;
        if (liveStream) {
            const { lastProcess } = liveStream;
            let btnProps = {
                name: "Live Stream",
                color: "info",
                lastProcess: "stop"
            }
            switch (liveStream.lastProcess) {
                case "stop":
                    btnProps = {
                        name: "Live Stream",
                        color: "info",
                        lastProcess
                    }
                    break;
                case "start":
                    btnProps = {
                        name: "Stop Stream",
                        color: "danger",
                        lastProcess
                    }
                    break;
                case "init":
                    btnProps = {
                        name: "Stop Init",
                        color: "warning",
                        lastProcess
                    }
                    break;
                default:
                    return null;
            }

            return <Button color={btnProps.color} onClick={() => this.handleStartStopStream(btnProps.lastProcess)}>{btnProps.name}</Button>
        }
    }

    toggleEditLiveForm = () => {
        this.setState({
            isConfigStream: !this.state.isConfigStream
        });
    }

    showDetailOfLiveStream = () => {
        const { liveStream } = this.state;

        if (liveStream) {
            let linkStreams = JSON.parse(liveStream.linkStream);
            return (
                <Row className="livestream-config">
                    <Col className="livestream-info" xs="12" sm="12" md="6">
                        <h3>Live Stream Information</h3>
                        <Row>
                            <Col>Name</Col>
                            <Col>{liveStream.name}</Col>
                        </Row>
                        <Row>
                            <Col>Description</Col>
                            <Col>{liveStream.description}</Col>
                        </Row>
                        <Row>
                            <Col>Thumbnail</Col>
                            <Col><img src={ liveStream.thumbnail && liveStream.thumbnail.length > 0 ? liveStream.thumbnail : "/assets/img/image-not-available.jpg"} /></Col>
                        </Row>
                    </Col>
                    <Col className="livestream-setting" xs="12" sm="12" md="6">
                        <h3>Live Stream setting</h3>
                        <Row>
                            <Col>Encode</Col>
                            <Col>{liveStream.encode ? "Yes" : "No"}</Col>
                        </Row>
                        <Row>
                            <Col>Record Stream</Col>
                            <Col>{liveStream.dvr ? "Yes" : "No"}</Col>
                        </Row>
                        <Row>
                            <Col>Mode</Col>
                            <Col>{liveStream.mode}</Col>
                        </Row>
                        <Row>
                            <Col>Link Stream</Col>
                            <Col>
                                {
                                    linkStreams.map((link, index) => {
                                        console.log(link);
                                        return <p key={index}>{link}</p>
                                    })
                                }
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )
        }
    }

    showFormEditLiveStream = () => {
        const { liveStream } = this.state;
        const linkStreams = JSON.parse(liveStream.linkStream).join(',')


        if (liveStream) {
            return (
                <Form className="entity-form-detail" onSubmit={this.handleEditEntityFormSubmit}>
                    <Row>
                        <Col xs="12" sm="12" md="5" className='form-info'>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0" row>
                                <Label for="enityId" className="mr-sm-2">ID</Label>
                                <Input type="text" name="id" value={liveStream.id} disabled />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="name" className="mr-sm-2">Name*</Label>
                                <Input type="text" name="name" defaultValue={liveStream.name} />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="description" className="mr-sm-2">Description</Label>
                                <Input type="textarea" name="description" defaultValue={liveStream.description ? liveStream.description : ""} />
                            </FormGroup>
                        </Col>
                        <Col xs="12" sm="12" md="5" className='form-setting'>
                            <legend>Encode</legend>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='encode' value={1} defaultChecked={liveStream.encode}/> Yes
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='encode' value={0} defaultChecked={!liveStream.encode}/> No
                                </Label>
                            </FormGroup>
                            <legend>Feed type</legend>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='mode' value='pull' defaultChecked={liveStream.mode === 'pull'}/> Pull
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='mode' value='push' defaultChecked={liveStream.mode === 'push'}/> Push
                                </Label>
                            </FormGroup>
                            <legend>Record stream</legend>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='recordstream' value={1} defaultChecked={liveStream.dvr}/> Yes
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="radio" name='recordstream' value={0} defaultChecked={!liveStream.dvr}/> No
                                </Label>
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 row">
                                <Label for="description" className="mr-sm-2">Link Stream*</Label>
                                <Input type="textarea" name="description" defaultValue={linkStreams ? linkStreams : ""} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button outline color="success" className="submit-form-edit">Submit</Button>
                </Form>
            )
        }
    }

    render() {
        console.log(this.state);
        const { isStreaming, isConfigStream } = this.state;

        return (
            <div className="livestream-detail">
                <div id="player" hidden={!isStreaming}></div>
                <img src="/assets/img/imageHolder.jpg" hidden={isStreaming} className='not-publish-holder' />
                <div className="livestream-control">
                    {this.showLiveStreamBtn()}
                    <Button color="danger" hidden={isStreaming}>Delete</Button>
                </div>
                <div className="setting-livestream-container">
                    <Button outline color="info" className="btn-edit-livestream" hidden={isStreaming} onClick={this.toggleEditLiveForm}>Edit</Button>
                    {isConfigStream ? this.showFormEditLiveStream() : this.showDetailOfLiveStream()}
                </div>
            </div>
        )
    }
}

export default LiveStreamDetail;