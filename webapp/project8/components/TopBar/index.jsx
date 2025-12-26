import React from "react";
import axios from "axios";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { withRouter } from "react-router-dom";

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.fileInputRef = React.createRef();
  }

  async handleLogout() {
    try {
      await axios.post("/admin/logout");
      if (this.props.onLogout) this.props.onLogout();
    } catch (error) {
      const errorMsg =
        error.response?.data || error.message || "Logout failed";
      console.error(errorMsg);
    }
  }

  handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await axios.delete('/user');
      if (this.props.onLogout) this.props.onLogout();
      this.props.history.push('/login');
    } catch (error) {
      console.error(error.response?.data || error.message || 'Delete failed');
    }
  };

  handleAddPhotoClick = () => {
    this.fileInputRef.current.click();
  };

  handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("uploadedphoto", file);

    try {
      await axios.post("/photos/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Photo uploaded successfully!");
      // Optionally navigate to the user's photo page
      const userId = this.props.user._id;
      this.props.history.push(`/photos/${userId}`);

      // Reset file input
      e.target.value = "";
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      console.error(`Failed to upload photo: ${errorMsg}`);
      e.target.value = "";
    }
  };

  render() {
    const path = this.props.location.pathname;
    const { user } = this.props;

    let rightText = "";
    const userName = user?.first_name;
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

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Typography variant="h6" style={{ marginRight: "16px" }}>
              {rightText}
            </Typography>

            <Typography variant="subtitle1" style={{ marginRight: "16px" }}>
              {user ? `Hi ${user.first_name}` : "Please Login"}
            </Typography>

            {user && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={this.fileInputRef}
                  onChange={this.handleFileChange}
                  style={{ display: "none" }}
                />
                <Button color="inherit" onClick={this.handleAddPhotoClick}>
                  Add Photo
                </Button>
                <Button color="inherit" onClick={() => this.props.history.push('/favorites')}>
                  Favorites
                </Button>
                <Button color="inherit" onClick={this.handleDeleteAccount}>
                  Delete Account
                </Button>
                <Button color="inherit" onClick={this.handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);



