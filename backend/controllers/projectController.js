const Project = require('../models/Project');

const ALLOWED_SORT_FIELDS = new Set([
  'projectDomain',
  'projectTitle',
  'typeOfApp',
  'whoWorkedOn',
  'technologyUsed',
  'database',
  'hostingPlatform',
  'publishedUrl',
  'createdAt',
  'updatedAt',
]);

const SEARCHABLE_FIELDS = [
  'projectDomain',
  'projectTitle',
  'typeOfApp',
  'applicationBrief',
  'featuresImplemented',
  'technologyUsed',
  'database',
  'dbUserPassword',
  'dbOwnership',
  'apisUsed',
  'gitRepo',
  'hostingPlatform',
  'localCodeAvailability',
  'localDb',
  'publishedUrl',
  'credentials',
  'localUrl',
  'localCredentials',
  'whoWorkedOn',
  'rolesInvolved',
];

const buildQuery = (queryParams) => {
  const { search, domain, appType, technology, db } = queryParams;
  const query = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = SEARCHABLE_FIELDS.map((field) => ({ [field]: regex }));
  }

  if (domain) {
    query.projectDomain = new RegExp(domain, 'i');
  }

  if (appType) {
    query.typeOfApp = appType;
  }

  if (technology) {
    query.technologyUsed = new RegExp(technology, 'i');
  }

  if (db) {
    query.database = new RegExp(db, 'i');
  }

  return query;
};

const getProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 10, 1);
    const safeSortBy = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    const query = buildQuery(req.query);

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ [safeSortBy]: safeSortOrder })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      Project.countDocuments(query),
    ]);

    res.status(200).json({
      data: projects,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(Math.ceil(total / safeLimit), 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
