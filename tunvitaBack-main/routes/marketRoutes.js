import express from 'express';
import{
    createMarket,
  getAllMarkets,
  getMarketById,
  updateMarketById,
  deleteMarketById

} from '../controllers/marketController.js';
const router = express.Router();

router.post('/addMarket', createMarket);
router.get('/', getAllMarkets);
router.get('/market/:id', getMarketById );
router.put('/market/:id', updateMarketById );
router.delete('/market/:id', deleteMarketById );
export default router;