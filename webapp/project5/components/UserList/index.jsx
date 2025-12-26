    import React from "react";
    import {
      Divider,
      List,
      ListItem,
      ListItemText,
      Typography,
    } from "@mui/material";
    import {Link} from "react-router-dom";
    import fetchModel from "../../lib/fetchModelData";

    import "./styles.css";

    /**
     * Define UserList, a React component of CS142 Project 5.
     */
    class UserList extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          users: []
        };
      }
    
      
    componentDidMount() {
      fetchModel("/user/list")
        .then((response) => this.setState({ users: response.data }))
        .catch((err) => console.error(err));
    }
      render() {
        return (
          
          <div>
            <Typography variant="h6">User List</Typography>
            <List component="nav">
              {this.state.users.map((user) => (
                <div key={user._id}>
                  <ListItem button component = {Link} to={"/users/" + user._id}>
                    <ListItemText primary={user.first_name + " " + user.last_name} />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </div>
          // <div>
          //   <Typography variant="body1">
          //     {/* This is the user list, which takes up 3/12 of the window. You might
          //     choose to use <a href="https://mui.com/components/lists/">Lists</a>{" "}
          //     and <a href="https://mui.com/components/dividers/">Dividers</a> to
          //     display your users like so: */}
          //     User list :
          //   </Typography>
          //   <List component="nav">
          //     <ListItem>
          //       <ListItemText primary="Item #1" />
          //     </ListItem>
          //     <Divider />
          //     <ListItem>
          //       <ListItemText primary="Item #2" />
          //     </ListItem>
          //     <Divider />
          //     <ListItem>
          //       <ListItemText primary="Item #3" />
          //     </ListItem>
          //     <Divider />
          //   </List>
          //   {/* <Typography variant="body1">
          //     The model comes in from window.cs142models.userListModel()
          //   </Typography> */}
          // </div>

        );
      }
    }
    

    export default UserList;
