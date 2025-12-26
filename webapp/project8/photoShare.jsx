import React from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import Favorites from "./components/Favorites";
import LoginRegister from "./components/LoginRegister";

// Ensure axios sends cookies for session handling
axios.defaults.withCredentials = true;

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedInUser: null,
    };
  }

  render() {
    const { loggedInUser } = this.state;

    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar user={loggedInUser} onLogout={() => this.setState({ loggedInUser: null })} />
            </Grid>

            <div className="cs142-main-topbar-buffer" />

            {/* LEFT: User list (login хийсэн үед л) */}
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                {loggedInUser && <UserList />}
              </Paper>
            </Grid>

            {/* RIGHT: Main content */}
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>

                  {/* LOGIN PAGE */}
                  <Route
                    path="/login"
                    render={() => {
                      if (loggedInUser) {
                        return <Redirect to={`/users/${loggedInUser._id || ""}`} />;
                      }
                      return (
                        <LoginRegister
                          onLogin={(user) => this.setState({ loggedInUser: user })}
                        />
                      );
                    }}
                  />

                  {/* USER DETAIL */}
                  <Route
                    path="/users/:userId"
                    render={(props) => {
                      if (loggedInUser) return <UserDetail {...props} loggedInUser={loggedInUser} />;
                      return <Redirect to="/login" />;
                    }}
                  />

                  {/* USER PHOTOS */}
                  <Route
                    path="/photos/:userId"
                    render={(props) => {
                      if (loggedInUser) return <UserPhotos {...props} loggedInUser={loggedInUser} />;
                      return <Redirect to="/login" />;
                    }}
                  />

                  {/* FAVORITES */}
                  <Route
                    path="/favorites"
                    render={(props) => {
                      if (loggedInUser) return <Favorites {...props} loggedInUser={loggedInUser} />;
                      return <Redirect to="/login" />;
                    }}
                  />

                  {/* DEFAULT */}
                  <Route
                    exact
                    path="/"
                    render={() => {
                      if (loggedInUser) return <Typography>Welcome!</Typography>;
                      return <Redirect to="/login" />;
                    }}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
