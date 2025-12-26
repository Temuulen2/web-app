import React from "react";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }
  componentDidMount() {
    const userId = this.props.match.params.userId;
    fetchModel(`/user/${userId}`)
      .then((response) => this.setState({ user: response.data }))
      .catch((err) => console.error(err));
  }

  render() {
    if (!this.state.user) {
        return <div>Loading user details...</div>;
      }
    return (
   
      <div>
        <Typography variant="h6">User Detail</Typography>
        <Typography variant="body1">
          This is the user detail view for user {this.state.user.first_name} {this.state.user.last_name}
        </Typography>
          <Typography variant="body1">
          user ID : {this.state.user._id}
          </Typography>
        <Typography> location : {this.state.user.location}s</Typography>
        <Typography variant="body1">description : {this.state.user.description}</Typography>
        <Typography variant="body1"> occupation : {this.state.user.occupation}</Typography>
        
        <Button
          variant="contained"
          color="primary"
          component={Link} 
          to={`/photos/${this.state.user._id}`} 
          style={{ marginTop: "10px" }}
        >
          View Photos
        </Button>


      </div>      // <Typography variant="body1">
      //   This should be the UserDetail view of the PhotoShare app. Since it is
      //   invoked from React Router the params from the route will be in property
      //   match. So this should show details of user:
      //   {this.props.match.params.userId}. You can fetch the model for the user
      //   from window.cs142models.userModel(userId).
      // </Typography>
    );
  }
}

export default UserDetail;
