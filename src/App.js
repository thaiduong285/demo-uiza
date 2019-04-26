import React, { Component } from 'react';
import axios from "axios";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import * as Components from "./Components";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    axios.defaults.baseURL = "https://ap-southeast-1-api.uiza.co/api/public/v4";
    axios.defaults.headers.common['Authorization'] = "uap-700c91ac20334eb38642032d69783c45-12843bda";
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
            <Route path="/live-streaming/create" component={Components.LiveStreamCreate} />
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
