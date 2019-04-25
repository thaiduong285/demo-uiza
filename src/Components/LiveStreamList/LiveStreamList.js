import React from "react";
import axios from "axios";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";

import "./LiveStreamList.css";

class LiveStreamList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveStreams: []
        }
    }

    componentDidMount() {
        this.retreiveListOfLiveStream();
    }

    retreiveListOfLiveStream = async () => {
        try {
            const res = await axios.get("/live/entity");
            const { code, data } = res.data;

            if(code === 200) {
                this.setState({ liveStreams: data });
            }
        }
        catch(err) {
            throw new Error(err);
        }
    }

    showListOfLiveStreams = () => {
        const { liveStreams } = this.state;

        return liveStreams.map((stream, index) => {
            let thumbnail = stream.thumbnail.length === 0 ? "/assets/img/image-not-available.jpg" : stream.thumbnail;
            let liveStreamBtn = () => {
                switch(stream.lastProcess) {
                    case "stop":
                        return <Button color="success">Live Stream</Button>; 
                    case "start": 
                        return <Button color="danger">Stop Stream</Button>;
                    case "init":
                        return <Button color="warning">Stop Initial</Button>;
                    default:
                        return <Button color="success">Live Stream</Button>;
                }
            }

            return (
                <div className="card-entity" key={index}>
                    <img className="entity-card-img" src={thumbnail} alt=""/>
                    <div className="entity-card-detail">
                        <p>{stream.name}</p>
                    </div>
                    <div className="entity-card-control">
                        <Link className="btn btn-outline-info" to={`/live-streaming/${stream.id}`}>View Detail</Link>
                        { liveStreamBtn() }
                    </div>
                </div>
            )
        });
    }
    render() {
        console.log(this.state);
        return (
            <div className="livestream-list">
                <div className="list-container">
                    { this.showListOfLiveStreams() }
                </div>
            </div>
        )
    }
}

export default LiveStreamList;