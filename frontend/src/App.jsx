import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import toast from 'react-hot-toast'
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from './api/projectApi'
import './App.css'

const fieldConfig = [
  { key: 'projectDomain', label: 'Project Domain', required: true },
  { key: 'projectTitle', label: 'Project Title', required: true },
  { key: 'typeOfApp', label: 'Type of App', required: true, select: true },
  { key: 'applicationBrief', label: 'Application Brief', multiline: true },
  { key: 'featuresImplemented', label: 'Features Implemented', multiline: true },
  { key: 'technologyUsed', label: 'Technology Used' },
  { key: 'database', label: 'Database' },
  { key: 'dbUserPassword', label: 'DB User & Password' },
  { key: 'dbOwnership', label: 'DB Ownership' },
  { key: 'apisUsed', label: 'APIs Used' },
  { key: 'gitRepo', label: 'Git Repo' },
  { key: 'hostingPlatform', label: 'Hosting Platform' },
  { key: 'localCodeAvailability', label: 'Local Code Availability' },
  { key: 'localDb', label: 'Local DB' },
  { key: 'publishedUrl', label: 'Published URL' },
  { key: 'credentials', label: 'Credentials', multiline: true },
  { key: 'localUrl', label: 'Local URL' },
  { key: 'localCredentials', label: 'Local Credentials' },
  { key: 'whoWorkedOn', label: "Project Developer's" },
  { key: 'rolesInvolved', label: 'Roles Involved' },
]

const tableColumns = [
  { key: 'projectTitle', label: 'Project Title' },
  { key: 'projectDomain', label: 'Domain' },
  { key: 'typeOfApp', label: 'App Type' },
  { key: 'whoWorkedOn', label: "Project Developer's" },
  { key: 'hostingPlatform', label: 'Hosting' },
]

const initialFormState = fieldConfig.reduce((acc, item) => {
  if (item.key === 'typeOfApp') {
    acc[item.key] = 'Web'
    return acc
  }

  acc[item.key] = ''
  return acc
}, {})

const appTypeOptions = ['All', 'Web', 'Mobile', 'Windows']

function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [appTypeFilter, setAppTypeFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [formValues, setFormValues] = useState(initialFormState)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await getProjects({
          page,
          limit: rowsPerPage,
          search: debouncedSearch || undefined,
          appType: appTypeFilter === 'All' ? undefined : appTypeFilter,
          sortBy,
          sortOrder,
        })

        setProjects(response.data)
        setPagination(response.pagination)
      } catch (requestError) {
        const message =
          requestError.response?.data?.message ||
          'Unable to load projects. Check server and API configuration.'

        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [debouncedSearch, appTypeFilter, page, rowsPerPage, sortBy, sortOrder])

  const stats = useMemo(() => {
    const byType = projects.reduce(
      (acc, item) => {
        acc[item.typeOfApp] = (acc[item.typeOfApp] || 0) + 1
        return acc
      },
      { Web: 0, Mobile: 0, Windows: 0 },
    )

    return {
      total: pagination.total,
      web: byType.Web || 0,
      mobile: byType.Mobile || 0,
      windows: byType.Windows || 0,
    }
  }, [pagination.total, projects])

  const openCreateModal = () => {
    setEditingProject(null)
    setFormValues(initialFormState)
    setIsModalOpen(true)
  }

  const openEditModal = (project) => {
    setEditingProject(project)
    setFormValues(
      fieldConfig.reduce((acc, item) => {
        acc[item.key] = project[item.key] || ''
        return acc
      }, {}),
    )
    setIsModalOpen(true)
  }

  const openDetailsModal = (project) => {
    setSelectedProject(project)
    setIsDetailsOpen(true)
  }

  const closeDetailsModal = () => {
    setIsDetailsOpen(false)
    setSelectedProject(null)
  }

  const handleEditFromDetails = () => {
    if (!selectedProject) {
      return
    }

    const project = selectedProject
    closeDetailsModal()
    openEditModal(project)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    setFormValues(initialFormState)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProject = async (event) => {
    event.preventDefault()

    setIsSaving(true)
    try {
      if (editingProject?._id) {
        await updateProject(editingProject._id, formValues)
        toast.success('Project updated')
      } else {
        await createProject(formValues)
        toast.success('Project created')
      }

      closeModal()

      const response = await getProjects({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        appType: appTypeFilter === 'All' ? undefined : appTypeFilter,
        sortBy,
        sortOrder,
      })

      setProjects(response.data)
      setPagination(response.pagination)
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Failed to save project. Please verify the form data.'

      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    const shouldDelete = window.confirm(
      'Delete this project record? This action cannot be undone.',
    )

    if (!shouldDelete) {
      return
    }

    try {
      await deleteProject(projectId)
      toast.success('Project deleted')

      const response = await getProjects({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        appType: appTypeFilter === 'All' ? undefined : appTypeFilter,
        sortBy,
        sortOrder,
      })

      setProjects(response.data)
      setPagination(response.pagination)
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || 'Failed to delete project'

      toast.error(message)
    }
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(column)
    setSortOrder('asc')
  }

  const renderCellValue = (project, columnKey) => {
    if (columnKey === 'typeOfApp') {
      return (
        <Chip
          size="small"
          label={project[columnKey] || '-'}
          color="primary"
          variant="outlined"
        />
      )
    }

    return project[columnKey] || '-'
  }

  return (
    <Box className="dashboard-shell">
      <Paper className="header-banner" elevation={0}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4">Project Tracker Dashboard</Typography>
            <Typography sx={{ opacity: 0.9, mt: 0.8 }}>
              Manage and automate project records with centralized CRUD control.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2.2} sx={{ mt: 0.4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card className="stat-card total">
            <CardContent>
              <Typography variant="overline">Total Projects</Typography>
              <Typography variant="h5">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card className="stat-card web">
            <CardContent>
              <Typography variant="overline">Web Apps</Typography>
              <Typography variant="h5">{stats.web}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card className="stat-card mobile">
            <CardContent>
              <Typography variant="overline">Mobile Apps</Typography>
              <Typography variant="h5">{stats.mobile}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card className="stat-card windows">
            <CardContent>
              <Typography variant="overline">Windows Apps</Typography>
              <Typography variant="h5">{stats.windows}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper className="table-panel" sx={{ mt: 2.2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ p: 2 }}
        >
          <TextField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by domain, title, feature, technology..."
            size="small"
            sx={{ width: { xs: '100%', md: 460 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1.2}>
            <Select
              size="small"
              value={appTypeFilter}
              onChange={(event) => {
                setAppTypeFilter(event.target.value)
                setPage(1)
              }}
            >
              {appTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'All' ? 'All App Types' : option}
                </MenuItem>
              ))}
            </Select>
            <Chip
              label={`Page ${page} of ${pagination.totalPages || 1}`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleOutlineRoundedIcon />}
              onClick={openCreateModal}
            >
              Add Project
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {isMobile ? (
          <Box className="mobile-project-list">
            {loading ? (
              <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : projects.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                No projects found for selected filters.
              </Box>
            ) : (
              projects.map((project) => (
                <Card
                  key={project._id}
                  className="project-mobile-card"
                  onClick={() => openDetailsModal(project)}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {project.projectTitle || '-'}
                      </Typography>
                      <Chip
                        size="small"
                        label={project.typeOfApp || '-'}
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.6 }}>
                      {project.projectDomain || '-'}
                    </Typography>

                    <Grid container spacing={1} sx={{ mt: 0.6 }}>
                      <Grid size={6}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Project Developer's
                        </Typography>
                        <Typography variant="body2">{project.whoWorkedOn || '-'}</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Hosting
                        </Typography>
                        <Typography variant="body2">{project.hostingPlatform || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={0.4}
                    className="mobile-action-strip"
                  >
                    <IconButton
                      color="primary"
                      onClick={(event) => {
                        event.stopPropagation()
                        openEditModal(project)
                      }}
                      aria-label="edit project"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteProject(project._id)
                      }}
                      aria-label="delete project"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Card>
              ))
            )}
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 570, overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableCell key={column.key}>
                      <TableSortLabel
                        active={sortBy === column.key}
                        direction={sortBy === column.key ? sortOrder : 'asc'}
                        onClick={() => handleSort(column.key)}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell align="right" className="action-cell action-cell-head">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length + 1} align="center">
                      <Box sx={{ py: 5 }}>
                        <CircularProgress size={28} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length + 1} align="center">
                      <Box sx={{ py: 4 }}>No projects found for selected filters.</Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow
                      key={project._id}
                      hover
                      className="project-row"
                      onClick={() => openDetailsModal(project)}
                    >
                      {tableColumns.map((column) => (
                        <TableCell key={column.key}>
                          {renderCellValue(project, column.key)}
                        </TableCell>
                      ))}
                      <TableCell
                        align="right"
                        className="action-cell"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        <IconButton
                          color="primary"
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditModal(project)
                          }}
                          aria-label="edit project"
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteProject(project._id)
                          }}
                          aria-label="delete project"
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={Math.max(page - 1, 0)}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value))
            setPage(1)
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveProject}>
          <DialogContent dividers>
            <Grid container spacing={1.8}>
              {fieldConfig.map((field) => (
                <Grid
                  key={field.key}
                  size={{ xs: 12, md: field.multiline ? 12 : 6 }}
                >
                  {field.select ? (
                    <TextField
                      select
                      fullWidth
                      label={field.label}
                      name={field.key}
                      value={formValues[field.key]}
                      onChange={handleFormChange}
                      required={field.required}
                    >
                      {appTypeOptions
                        .filter((option) => option !== 'All')
                        .map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      label={field.label}
                      name={field.key}
                      value={formValues[field.key]}
                      onChange={handleFormChange}
                      required={field.required}
                      multiline={field.multiline}
                      minRows={field.multiline ? 3 : undefined}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSaving}
            >
              {isSaving
                ? 'Saving...'
                : editingProject
                  ? 'Update Project'
                  : 'Create Project'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={isDetailsOpen}
        onClose={closeDetailsModal}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent dividers>
          {selectedProject ? (
            <Grid container spacing={1.8}>
              {fieldConfig.map((field) => (
                <Grid
                  key={field.key}
                  size={{ xs: 12, md: field.multiline ? 12 : 6 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', letterSpacing: 0.4 }}
                  >
                    {field.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mt: 0.3, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {selectedProject[field.key] || '-'}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDetailsModal}>Close</Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditOutlinedIcon />}
            onClick={handleEditFromDetails}
          >
            Edit Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App
