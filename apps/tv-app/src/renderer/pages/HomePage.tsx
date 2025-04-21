import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Paper, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Sample video data - in a real app this would come from an API or file system
  const sampleVideos = [
    { id: 1, title: 'Sample Movie 1', thumbnail: 'https://via.placeholder.com/300x169' },
    { id: 2, title: 'Sample Movie 2', thumbnail: 'https://via.placeholder.com/300x169' },
    { id: 3, title: 'Sample Movie 3', thumbnail: 'https://via.placeholder.com/300x169' },
    { id: 4, title: 'Sample Movie 4', thumbnail: 'https://via.placeholder.com/300x169' },
  ];

  return (
    <Box>
      <Paper
        sx={{
          position: 'relative',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url(https://via.placeholder.com/1200x400)`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
          }}
        >
          <Typography component="h1" variant="h3" color="white" gutterBottom>
            Welcome to SafeView AI
          </Typography>
          <Typography variant="h5" color="white" paragraph>
            Enjoy your content filtered according to your preferences, providing a safe viewing experience for everyone.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/player')}
            sx={{ mr: 2 }}
          >
            Start Watching
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/preferences')}
          >
            Configure Preferences
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Recent Videos
      </Typography>
      <Grid container spacing={3}>
        {sampleVideos.map((video) => (
          <Grid item xs={12} sm={6} md={3} key={video.id}>
            <Card>
              <CardActionArea onClick={() => navigate('/player')}>
                <CardMedia
                  component="img"
                  height="169"
                  image={video.thumbnail}
                  alt={video.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {video.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage; 