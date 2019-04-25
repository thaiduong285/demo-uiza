import React, { Component } from 'react';
import axios from "axios";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import * as Components from "./Components";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    axios.defaults.baseURL = "https://ap-southeast-1-api.uiza.co/api/public/v4";
    axios.defaults.headers.common['Authorization'] = "uap-098b45c5d7c046c0bf6cd16389486c4b-74fbf5f5";
  }

  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Components.NavBar />
          <Switch>
            <Route path="/entity/create" component={Components.EntityCreate} />
            <Route path="/entity/:id" component={Components.EntityDetail} />
            <Route path="/entity" component={Components.EntityList} />
            <Route path="/live-streaming/:id" component={Components.LiveStreamDetail} />
            <Route path="/live-streaming" component={Components.LiveStreamList} />
            <Route path="*" exact component={Components.NotFound} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
