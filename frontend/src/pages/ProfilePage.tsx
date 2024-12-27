import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Mock user data - will be replaced with real API data
const mockUserData = {
  username: 'john.doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Investment Corp',
  position: 'Portfolio Manager',
  avatar: '',
  preferences: {
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
  }
};

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePreferenceChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: event.target.checked
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // TODO: Implement actual API call to save user data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('success');
      setIsEditing(false);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{ width: 100, height: 100 }}
                src={userData.avatar || undefined}
              >
                {userData.firstName?.[0]}{userData.lastName?.[0]}
              </Avatar>
              <Button
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  minWidth: 'auto',
                  padding: '8px',
                  borderRadius: '50%',
                }}
                variant="contained"
              >
                <PhotoCameraIcon fontSize="small" />
                <VisuallyHiddenInput type="file" accept="image/*" />
              </Button>
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom>
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.position} at {userData.company}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Personal Information</Typography>
              <Button
                variant={isEditing ? "contained" : "outlined"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={24} /> : isEditing ? 'Save' : 'Edit'}
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userData.firstName}
                  onChange={handleInputChange('firstName')}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userData.lastName}
                  onChange={handleInputChange('lastName')}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={userData.company}
                  onChange={handleInputChange('company')}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={userData.position}
                  onChange={handleInputChange('position')}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
            {saveStatus && (
              <Box sx={{ mt: 2 }}>
                <Alert severity={saveStatus}>
                  {saveStatus === 'success' ? 'Profile updated successfully!' : 'Error updating profile. Please try again.'}
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.preferences.emailNotifications}
                    onChange={handlePreferenceChange('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.preferences.darkMode}
                    onChange={handlePreferenceChange('darkMode')}
                  />
                }
                label="Dark Mode"
              />
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.preferences.twoFactorAuth}
                    onChange={handlePreferenceChange('twoFactorAuth')}
                  />
                }
                label="Two-Factor Authentication"
              />
            </Box>
          </Paper>

          {/* Security Section */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{ mb: 2 }}
            >
              Change Password
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
            >
              Delete Account
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
