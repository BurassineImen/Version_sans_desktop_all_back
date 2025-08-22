import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  getProductsByCategory,
  getMostUsedCategories
  //getTopCategories

} from '../controllers/categoryController.js';



const router = express.Router();

router.post('/addCategory', createCategory);
router.get('/', getAllCategories);
//router.get('/top', getTopCategories);
router.get('/most-used', getMostUsedCategories);
router.get('/:id/products', getProductsByCategory);
router.get('/category/:id', getProductsByCategory );
router.put('/category/:id', updateCategoryById );
router.delete('/category/:id', deleteCategoryById );

// autres routes

export default router;