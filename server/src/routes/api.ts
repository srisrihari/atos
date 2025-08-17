import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { dashboardController } from '../controllers/dashboards.js';
import { dataSourceController } from '../controllers/dataSources.js';
import { aiInsightsController } from '../controllers/aiInsights.js';
import { chatInterfaceController } from '../controllers/chatInterface.js';
import { forecastingController } from '../controllers/forecasting.js';

export const apiRoutes = Router();

// Health check endpoint
apiRoutes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dashboard routes
apiRoutes.use('/dashboards', requireAuth);
apiRoutes.get('/dashboards', dashboardController.getAll);
apiRoutes.post('/dashboards', dashboardController.create);
apiRoutes.get('/dashboards/:id', dashboardController.getById);
apiRoutes.put('/dashboards/:id', dashboardController.update);
apiRoutes.delete('/dashboards/:id', dashboardController.delete);

// Data source routes
apiRoutes.use('/data-sources', requireAuth);
apiRoutes.get('/data-sources', dataSourceController.getAll);
apiRoutes.post('/data-sources', dataSourceController.uploadMiddleware, dataSourceController.create);
apiRoutes.get('/data-sources/:id/preview', dataSourceController.getPreview);
apiRoutes.delete('/data-sources/:id', dataSourceController.delete);

// AI Insights routes
apiRoutes.use('/insights', requireAuth);
apiRoutes.post('/insights/generate', aiInsightsController.generateInsights);
apiRoutes.get('/insights/:dataSourceId', aiInsightsController.getInsights);
apiRoutes.post('/insights/visualizations', aiInsightsController.suggestVisualizations);

// Chat Interface routes
apiRoutes.use('/chat', requireAuth);
apiRoutes.post('/chat/ask', chatInterfaceController.askQuestion);
apiRoutes.post('/chat/explain-query', chatInterfaceController.getQueryExplanation);
apiRoutes.get('/chat/history', chatInterfaceController.getChatHistory);

// Forecasting routes
apiRoutes.use('/forecasting', requireAuth);
apiRoutes.post('/forecasting/generate', forecastingController.generateForecast);
apiRoutes.post('/forecasting/anomalies', forecastingController.detectAnomalies);
apiRoutes.post('/forecasting/seasonality', forecastingController.analyzeSeasonality);