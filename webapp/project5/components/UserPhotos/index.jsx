import React from "react";
import { Typography, Grid, Paper, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: []
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;

    fetchModel(`/photosOfUser/${userId}`)
      .then((response) => {
        let data = response.data;

        // --- хамгаалалт №1: data нь array эсэх ---
        if (Array.isArray(data)) {
          this.setState({ photos: data });
          return;
        }

        // --- хамгаалалт №2: data дотор photos array байгаа эсэх ---
        if (data && Array.isArray(data.photos)) {
          this.setState({ photos: data.photos });
          return;
        }

        // --- хамгаалалт №3: object ирсэн бол хоосон гэж үзнэ ---
        console.error("Expected array but got:", data);
        this.setState({ photos: [] });
      })
      .catch((err) => console.error("Fetch error:", err));
  }

  render() {
    const { photos } = this.state;

    return (
      <div>
        <Typography variant="h6" gutterBottom>
          User Photos
        </Typography>

        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item key={photo._id} xs={12} sm={6} md={4}>
              <Paper style={{ padding: "10px" }}>
                <img
                  src={`/images/${photo.file_name}`}
                  alt={photo.file_name}
                  style={{ width: "100%", marginBottom: "8px" }}
                />

                <Typography variant="body2">
                  Taken on: {new Date(photo.date_time).toLocaleString()}
                </Typography>

                <Typography variant="body2" style={{ fontWeight: "bold", marginTop: "8px" }}>
                  Comments:
                </Typography>

                {photo.comments && photo.comments.length > 0 ? (
                  <List dense>
                    {photo.comments.map((comment) => (
                      <ListItem key={comment._id} alignItems="flex-start">
                        <ListItemText
                          primary={(
                            <span>
                              <Link to={`/users/${comment.user._id}`}>
                                {comment.user.first_name} {comment.user.last_name}
                              </Link>{" "}
                              commented on {new Date(comment.date_time).toLocaleString()}:
                            </span>
                    )}
                          secondary={<Typography variant="body2">{comment.comment}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No comments yet.
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }
}

export default UserPhotos;
