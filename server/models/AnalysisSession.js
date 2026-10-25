/**
 * MedulloSight — AnalysisSession Model
 */

import mongoose from 'mongoose';

const AnalysisSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  filename: { type: String, required: true },
  sequence: { type: String, enum: ['T1', 'T1C+', 'T2', 'Unknown'], default: 'Unknown' },
  dimensions: {
    width: Number,
    height: Number,
    channels: Number
  },
  total_duration_ms: Number,
  parameters: {
    contrast_low_p: Number,
    contrast_high_p: Number,
    gamma: Number,
    butterworth_d0: Number,
    butterworth_order: Number,
    median_kernel: Number,
    morph_radius_small: Number,
    morph_radius_large: Number
  },
  metrics: {
    initial_mean: Number,
    initial_std: Number,
    stretched_std: Number,
    entropy: Number,
    otsu_threshold: Number,
    foreground_percent: Number,
    cc_count_before_open: Number,
    cc_count_after_open: Number,
    cc_reduction_percent: Number,
    has_candidate: Boolean,
    roi_area_pixels: Number,
    roi_area_percent: Number,
    roi_bbox: [Number],
    centroid: [Number]
  },
  warnings: [{
    code: String,
    severity: String,
    message: String
  }],
  steps_log: [{
    step: Number,
    name: String,
    stage: String,
    duration_ms: Number,
    status: String
  }],
  step_images: {
    type: Map,
    of: String
  },
  createdAt: { type: Date, default: Date.now }
});

export const AnalysisSession = mongoose.model('AnalysisSession', AnalysisSessionSchema);
