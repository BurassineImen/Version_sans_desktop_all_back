import express from 'express';
import{
    createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById

} from '../controllers/productController.js';
const router = express.Router();

router.post('/addProduct', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById );
router.put('/updateProduct/:id', updateProductById );
router.delete('/deleteProduct/:id', deleteProductById );
export default router;