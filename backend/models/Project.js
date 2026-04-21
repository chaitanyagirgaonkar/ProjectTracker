const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectDomain: {
      type: String,
      required: [true, 'Project Domain is required'],
      trim: true,
      maxlength: 120,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project Title is required'],
      trim: true,
      maxlength: 160,
    },
    typeOfApp: {
      type: String,
      required: [true, 'Type of App is required'],
      enum: ['Web', 'Mobile', 'Windows'],
    },
    applicationBrief: { type: String, trim: true, default: '' },
    featuresImplemented: { type: String, trim: true, default: '' },
    technologyUsed: { type: String, trim: true, default: '' },
    database: { type: String, trim: true, default: '' },
    dbUserPassword: { type: String, trim: true, default: '' },
    dbOwnership: { type: String, trim: true, default: '' },
    apisUsed: { type: String, trim: true, default: '' },
    gitRepo: { type: String, trim: true, default: '' },
    hostingPlatform: { type: String, trim: true, default: '' },
    localCodeAvailability: { type: String, trim: true, default: '' },
    localDb: { type: String, trim: true, default: '' },
    publishedUrl: { type: String, trim: true, default: '' },
    credentials: { type: String, trim: true, default: '' },
    localUrl: { type: String, trim: true, default: '' },
    localCredentials: { type: String, trim: true, default: '' },
    rolesInvolved: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
