const express = require('express');
const router = express.Router();
const upload = require('../Middlewares/multerConfig'); 
const {
  addResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  getFile,
} = require('../controllers/resourceController');

router.post('/upload', upload.single('file'), addResource);
router.get('/', getAllResources);
router.get('/:id', getResourceById);
router.put('/:id', upload.single('file'), updateResource);
router.delete('/:id', deleteResource);
router.get('/file/:filename', getFile);

module.exports = router;
