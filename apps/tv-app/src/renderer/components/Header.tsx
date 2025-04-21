import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SettingsIcon from '@mui/icons-material/Settings';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SafeView AI
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/player"
            startIcon={<VideoLibraryIcon />}
          >
            Player
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/preferences"
            startIcon={<SettingsIcon />}
          >
            Preferences
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 