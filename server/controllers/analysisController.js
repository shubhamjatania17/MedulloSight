/**
 * MedulloSight — Analysis Controller
 * Coordinates single-slice image analysis with the Python scientific engine.
 */

import axios from 'axios';
import crypto from 'crypto';
import { AnalysisSession } from '../models/AnalysisSession.js';
import { isDbConnected, getMemoryStore } from '../config/db.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

export async function processSingleImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const {
      sequence = 'Unknown',
      contrast_low_p = 1.0,
      contrast_high_p = 99.0,
      gamma = 0.5,
      butterworth_d0 = 50.0,
      butterworth_order = 2,
      median_kernel = 3,
      morph_radius_small = 3,
      morph_radius_large = 7
    } = req.body;

    // Build FormData to send to Python FastAPI microservice
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);
    formData.append('sequence', sequence);
    formData.append('contrast_low_p', contrast_low_p.toString());
    formData.append('contrast_high_p', contrast_high_p.toString());
    formData.append('gamma', gamma.toString());
    formData.append('butterworth_d0', butterworth_d0.toString());
    formData.append('butterworth_order', butterworth_order.toString());
    formData.append('median_kernel', median_kernel.toString());
    formData.append('morph_radius_small', morph_radius_small.toString());
    formData.append('morph_radius_large', morph_radius_large.toString());

    // Dispatch to Python FastAPI service
    const pyResponse = await axios.post(`${PYTHON_SERVICE_URL}/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024,
      timeout: 30000
    });

    const result = pyResponse.data;
    const sessionId = crypto.randomUUID();
    result.sessionId = sessionId;

    // Persist session
    if (isDbConnected()) {
      try {
        await AnalysisSession.create({
          sessionId,
          filename: req.file.originalname,
          sequence: result.sequence,
          dimensions: result.dimensions,
          total_duration_ms: result.total_duration_ms,
          parameters: result.parameters,
          metrics: result.metrics,
          warnings: result.warnings,
          steps_log: result.steps_log,
          step_images: result.step_images
        });
      } catch (dbErr) {
        console.warn('[Database] Could not persist session to Mongo:', dbErr.message);
      }
    } else {
      // Memory store fallback
      const store = getMemoryStore();
      store.sessions.set(sessionId, {
        ...result,
        createdAt: new Date()
      });
      // Cap memory store at 50 sessions
      if (store.sessions.size > 50) {
        const firstKey = store.sessions.keys().next().value;
        store.sessions.delete(firstKey);
      }
    }

    return res.json(result);
  } catch (error) {
    console.error('[Analysis Error]', error.message);
    const detail = error.response?.data?.detail || error.message;
    return res.status(500).json({
      error: 'Image processing failed in scientific engine.',
      detail
    });
  }
}

export async function getSessions(req, res) {
  try {
    if (isDbConnected()) {
      const sessions = await AnalysisSession.find({})
        .select('sessionId filename sequence dimensions total_duration_ms metrics warnings createdAt')
        .sort({ createdAt: -1 })
        .limit(20);
      return res.json({ sessions });
    } else {
      const store = getMemoryStore();
      const sessions = Array.from(store.sessions.values())
        .map(s => ({
          sessionId: s.sessionId,
          filename: s.filename,
          sequence: s.sequence,
          dimensions: s.dimensions,
          total_duration_ms: s.total_duration_ms,
          metrics: s.metrics,
          warnings: s.warnings,
          createdAt: s.createdAt
        }))
        .reverse()
        .slice(0, 20);
      return res.json({ sessions });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve sessions', detail: err.message });
  }
}

export async function getSessionById(req, res) {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const session = await AnalysisSession.findOne({ sessionId: id });
      if (!session) return res.status(404).json({ error: 'Session not found' });
      return res.json(session);
    } else {
      const store = getMemoryStore();
      const session = store.sessions.get(id);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      return res.json(session);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve session', detail: err.message });
  }
}

export async function generateReportPdf(req, res) {
  try {
    const payload = req.body;
    const pyResponse = await axios.post(`${PYTHON_SERVICE_URL}/report/pdf`, payload, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=MedulloSight_Report_${payload.sequence || 'MRI'}.pdf`);
    return res.send(pyResponse.data);
  } catch (err) {
    console.error('[PDF Report Error]', err.message);
    return res.status(500).json({ error: 'Failed to generate PDF report', detail: err.message });
  }
}

export async function benchmarkNoise(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }
    const { density = 0.05 } = req.body;
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);
    formData.append('density', density.toString());

    const pyResponse = await axios.post(`${PYTHON_SERVICE_URL}/benchmark/noise`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 20000
    });

    return res.json(pyResponse.data);
  } catch (err) {
    return res.status(500).json({ error: 'Noise benchmark failed', detail: err.message });
  }
}

export async function getSamples(req, res) {
  try {
    const pyResponse = await axios.get(`${PYTHON_SERVICE_URL}/samples`, { timeout: 5000 });
    return res.json(pyResponse.data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch samples', detail: err.message });
  }
}
