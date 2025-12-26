import React from "react";
import axios from "axios";
import { Grid, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = { photos: [], preview: null };
  }

  componentDidMount() {
    this.fetchFavorites();
  }

  fetchFavorites = async () => {
    try {
      const r = await axios.get("/favorites");
      this.setState({ photos: r.data || [] });
    } catch (e) {
      console.error(e.response?.data || e.message);
    }
  };

  removeFavorite = async (photoId) => {
    try {
      await axios.delete(`/favorites/${photoId}`);
      this.setState({ photos: this.state.photos.filter((p) => p._id !== photoId) });
    } catch (e) {
      console.error(e.response?.data || e.message);
    }
  };

  openPreview = (photo) => this.setState({ preview: photo });
  closePreview = () => this.setState({ preview: null });

  render() {
    const { photos, preview } = this.state;
    return (
      <div>
        <Typography variant="h6">My Favorites</Typography>
        <Grid container spacing={2} style={{ marginTop: 8 }}>
          {photos.map((photo) => (
            <Grid item key={photo._id} xs={6} sm={4} md={3}>
              <Paper style={{ padding: 8, position: "relative" }}>
                <img src={`/images/${photo.file_name}`} alt={photo.file_name} style={{ width: "100%", cursor: "pointer" }} onClick={() => this.openPreview(photo)} />
                <IconButton size="small" onClick={() => this.removeFavorite(photo._id)} style={{ position: "absolute", top: 4, right: 4 }}>
                  <CloseIcon />
                </IconButton>
                <Typography variant="caption">{new Date(photo.date_time).toLocaleDateString()}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={Boolean(preview)} onClose={this.closePreview} maxWidth="md" fullWidth>
          <DialogTitle>Favorite Photo</DialogTitle>
          <DialogContent>
            {preview && (
              <div style={{ textAlign: "center" }}>
                <img src={`/images/${preview.file_name}`} alt="preview" style={{ maxWidth: "100%" }} />
                <Typography variant="caption" display="block">{new Date(preview.date_time).toLocaleString()}</Typography>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default Favorites;
