import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { VideoController } from './controllers/video.controller';
import { PreferencesController } from './controllers/preferences.controller';
import { join } from 'path';

export class App {
  private app: express.Application;
  private videoController: VideoController;
  private preferencesController: PreferencesController;

  constructor() {
    this.app = express();
    this.videoController = new VideoController();
    this.preferencesController = new PreferencesController();
    this.initialize();
  }

  private initialize() {
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(fileUpload({
      createParentPath: true,
      limits: {
        fileSize: 1024 * 1024 * 1024 // 1GB max file size
      }
    }));

    // Static files
    this.app.use('/temp', express.static(join(process.cwd(), 'temp')));

    // Routes
    this.setupRoutes();

    // Error handling
    this.app.use(this.errorHandler);
  }

  private setupRoutes() {
    // Video routes
    this.app.post('/api/video/analyze', (req, res) => this.videoController.analyzeVideo(req, res));
    this.app.post('/api/video/process', (req, res) => this.videoController.processVideo(req, res));
    this.app.get('/api/video/stream/:videoPath', (req, res) => this.videoController.streamVideo(req, res));

    // Preferences routes
    this.app.get('/api/preferences', (req, res) => this.preferencesController.getPreferences(req, res));
    this.app.put('/api/preferences', (req, res) => this.preferencesController.updatePreferences(req, res));
  }

  private errorHandler(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  public async start(port: number = 3000) {
    try {
      this.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async cleanup() {
    await this.videoController.cleanup();
  }
} 