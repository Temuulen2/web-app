import React from "react";
import axios from "axios";
import {
  Typography,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Tab state
      tabValue: 0, // 0 = Login, 1 = Register

      // Login fields
      login_name: "",
      password: "",
      loginError: null,

      // Register fields
      reg_login_name: "",
      reg_password: "",
      reg_password_confirm: "",
      reg_first_name: "",
      reg_last_name: "",
      reg_location: "",
      reg_description: "",
      reg_occupation: "",
      registerError: null,
      registerSuccess: null,
    };

    this.handleLoginChange = this.handleLoginChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegisterChange = this.handleRegisterChange.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(event, newValue) {
    this.setState({
      tabValue: newValue,
      loginError: null,
      registerError: null,
      registerSuccess: null,
    });
  }

  handleLoginChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value, loginError: null });
  }

  async handleLogin() {
    if (!this.state.login_name || !this.state.password) {
      this.setState({ loginError: "Login name and password are required" });
      return;
    }

    try {
      const resp = await axios.post("/admin/login", {
        login_name: this.state.login_name,
        password: this.state.password,
      });

      const user = resp.data;
      if (this.props.onLogin) this.props.onLogin(user);
    } catch (error) {
      const errorMsg = error.response?.data || error.message || "Login failed";
      this.setState({ loginError: errorMsg });
    }
  }

  handleRegisterChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value, registerError: null });
  }

  async handleRegister() {
    const {
      reg_login_name,
      reg_password,
      reg_password_confirm,
      reg_first_name,
      reg_last_name,
      reg_location,
      reg_description,
      reg_occupation,
    } = this.state;

    // Validate required fields
    if (!reg_login_name || !reg_login_name.trim()) {
      this.setState({ registerError: "Login name is required" });
      return;
    }

    if (!reg_first_name || !reg_first_name.trim()) {
      this.setState({ registerError: "First name is required" });
      return;
    }

    if (!reg_last_name || !reg_last_name.trim()) {
      this.setState({ registerError: "Last name is required" });
      return;
    }

    if (!reg_password || !reg_password.trim()) {
      this.setState({ registerError: "Password is required" });
      return;
    }

    if (reg_password !== reg_password_confirm) {
      this.setState({ registerError: "Passwords do not match" });
      return;
    }

    try {
      await axios.post("/user", {
        login_name: reg_login_name,
        password: reg_password,
        first_name: reg_first_name,
        last_name: reg_last_name,
        location: reg_location || "",
        description: reg_description || "",
        occupation: reg_occupation || "",
      });

      // Clear form and show success message
      this.setState({
        registerSuccess:
          "Registration successful! You can now login with your credentials.",
        reg_login_name: "",
        reg_password: "",
        reg_password_confirm: "",
        reg_first_name: "",
        reg_last_name: "",
        reg_location: "",
        reg_description: "",
        reg_occupation: "",
      });

      // Optionally auto-login or switch to login tab
      setTimeout(() => {
        this.setState({ tabValue: 0, registerSuccess: null });
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      this.setState({ registerError: errorMsg });
    }
  }

  render() {
    const { tabValue, loginError, registerError, registerSuccess } = this.state;

    return (
      <Box sx={{ width: "100%", maxWidth: 500, margin: "0 auto" }}>
        <Tabs
          value={tabValue}
          onChange={this.handleTabChange}
          aria-label="login/register tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* LOGIN TAB */}
        {tabValue === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Login
            </Typography>

            {loginError && <Alert severity="error">{loginError}</Alert>}

            <TextField
              label="Login Name"
              name="login_name"
              value={this.state.login_name}
              onChange={this.handleLoginChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={this.state.password}
              onChange={this.handleLoginChange}
              fullWidth
              margin="normal"
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={this.handleLogin}
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </Box>
        )}

        {/* REGISTER TAB */}
        {tabValue === 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Register New Account
            </Typography>

            {registerError && <Alert severity="error">{registerError}</Alert>}
            {registerSuccess && (
              <Alert severity="success">{registerSuccess}</Alert>
            )}

            <TextField
              label="Login Name"
              name="reg_login_name"
              value={this.state.reg_login_name}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="First Name"
              name="reg_first_name"
              value={this.state.reg_first_name}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Last Name"
              name="reg_last_name"
              value={this.state.reg_last_name}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Password"
              name="reg_password"
              type="password"
              value={this.state.reg_password}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Confirm Password"
              name="reg_password_confirm"
              type="password"
              value={this.state.reg_password_confirm}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Location"
              name="reg_location"
              value={this.state.reg_location}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Description"
              name="reg_description"
              value={this.state.reg_description}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />

            <TextField
              label="Occupation"
              name="reg_occupation"
              value={this.state.reg_occupation}
              onChange={this.handleRegisterChange}
              fullWidth
              margin="normal"
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={this.handleRegister}
              sx={{ mt: 2 }}
            >
              Register Me
            </Button>
          </Box>
        )}
      </Box>
    );
  }
}

export default LoginRegister;

