import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { withRouter } from "react-router-dom";




class TopBar extends React.Component {
  render() {
    const path = this.props.location.pathname;
    const { userName } = this.props;

    let rightText = "";
    if (path.startsWith("/photos/")) {
      rightText = `Photos of ${userName || ""}`;
    } else if (path.startsWith("/users/")) {
      rightText = `Info of ${userName || ""}`;
    }

    return (
      <AppBar position="absolute">
        <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" color="inherit">
            Temuulen
          </Typography>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" style={{ marginRight: "16px" }}>
              {rightText}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);



