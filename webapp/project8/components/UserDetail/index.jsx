import React from "react";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
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
    axios.get(`/user/${userId}`).then((response) => {
      this.setState({ user: response.data });
    }).catch((err) => console.error(err));
  }
  //   fetchModel(`/user/${userId}`)
  //     .then((response) => this.setState({ user: response.data }))
  //     .catch((err) => console.error(err));
  // }

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


      </div>
    );
  }
}

export default UserDetail;
