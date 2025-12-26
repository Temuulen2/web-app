import React from "react";
import {
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { Link } from "react-router-dom";
import "./styles.css";
import axios from "axios";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      commentInput: {}, // Store comment text per photo ID
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;
    axios
      .get(`/photosOfUser/${userId}`)
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

  handleCommentChange = (photoId, value) => {
    this.setState((prevState) => ({
      commentInput: {
        ...prevState.commentInput,
        [photoId]: value,
      },
    }));
  };

  handleAddComment = async (photoId) => {
    const commentText = this.state.commentInput[photoId];

    if (!commentText || commentText.trim() === "") {
      console.warn("Comment cannot be empty");
      return;
    }

    try {
      const response = await axios.post(`/commentsOfPhoto/${photoId}`, {
        comment: commentText,
      });

      // Update the photos list with the new comment
      const updatedPhotos = this.state.photos.map((photo) => {
        if (photo._id === photoId) {
          return {
            ...photo,
            comments: [...(photo.comments || []), response.data],
          };
        }
        return photo;
      });

      this.setState({
        photos: updatedPhotos,
        commentInput: {
          ...this.state.commentInput,
          [photoId]: "", // Clear input after successful post
        },
      });
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      console.error(`Failed to add comment: ${errorMsg}`);
    }
  };

  handleLikeToggle = async (photo) => {
    try {
      if (photo.liked_by_user) {
        const r = await axios.post(`/photos/${photo._id}/unlike`);
        photo.liked_by_user = false;
        photo.likes_count = r.data.likes_count;
      } else {
        const r = await axios.post(`/photos/${photo._id}/like`);
        photo.liked_by_user = true;
        photo.likes_count = r.data.likes_count;
      }
      this.setState({ photos: this.state.photos.map((p) => (p._id === photo._id ? photo : p)) });
    } catch (e) {
      console.error(e.response?.data || e.message);
    }
  };

  handleFavorite = async (photo) => {
    try {
      if (photo.favorited_by_user) return; // already favorited
      await axios.post(`/favorites/${photo._id}`);
      photo.favorited_by_user = true;
      this.setState({ photos: this.state.photos.map((p) => (p._id === photo._id ? photo : p)) });
    } catch (e) {
      console.error(e.response?.data || e.message);
    }
  };

  handleDeleteComment = async (photoId, commentId) => {
    try {
      await axios.delete(`/comments/${photoId}/${commentId}`);
      const updatedPhotos = this.state.photos.map((photo) => {
        if (photo._id === photoId) {
          return { ...photo, comments: (photo.comments || []).filter((c) => c._id !== commentId) };
        }
        return photo;
      });
      this.setState({ photos: updatedPhotos });
    } catch (e) {
      console.error(e.response?.data || e.message);
    }
  };

  handleDeletePhoto = async (photoId) => {
    try {
      await axios.delete(`/photos/${photoId}`);
      this.setState({ photos: this.state.photos.filter((p) => p._id !== photoId) });
    } catch (e) {
      console.error(e.response?.data || e.message);
    }
  };



  render() {
    const { photos, commentInput } = this.state;

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
                  style={{ width: "100%", marginBottom: "8px", cursor: "pointer" }}
                  onClick={() => this.openPreview(photo)}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">
                    Taken on: {new Date(photo.date_time).toLocaleString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => this.handleDeletePhoto(photo._id)}
                  >
                    Delete Photo
                  </Button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <IconButton size="small" onClick={() => this.handleLikeToggle(photo)}>
                    {photo.liked_by_user ? <ThumbUpIcon color="primary" /> : <ThumbUpOffAltIcon />}
                  </IconButton>
                  <Typography variant="body2">{photo.likes_count || 0}</Typography>

                  <IconButton size="small" onClick={() => this.handleFavorite(photo)} disabled={photo.favorited_by_user}>
                    {photo.favorited_by_user ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                </div>

                <Typography
                  variant="body2"
                  style={{ fontWeight: "bold", marginTop: "8px" }}
                >
                  Comments:
                </Typography>

                {photo.comments && photo.comments.length > 0 ? (
                  <List>
                    {photo.comments.map((comment) => (
                      <ListItem key={comment._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <ListItemText
                          primary={(
                            <span>
                              <Link to={`/users/${comment.user._id}`}>
                                {comment.user.first_name} {comment.user.last_name}
                              </Link>{" "}
                              commented on {new Date(comment.date_time).toLocaleString()}:
                            </span>
                          )}
                          secondary={(
                            <Typography variant="body2">
                              {comment.comment}
                            </Typography>
                          )}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => this.handleDeleteComment(photo._id, comment._id)}
                          style={{ marginLeft: "8px", whiteSpace: "nowrap" }}
                        >
                          Delete
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No comments yet.
                  </Typography>
                )}

                {/* Comment input form */}
                <div style={{ marginTop: "12px" }}>
                  <TextField
                    label="Add a comment..."
                    multiline
                    rows={2}
                    value={commentInput[photo._id] || ""}
                    onChange={(e) => this.handleCommentChange(photo._id, e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => this.handleAddComment(photo._id)}
                    style={{ marginTop: "8px" }}
                  >
                    Post Comment
                  </Button>
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }
}

export default UserPhotos;
