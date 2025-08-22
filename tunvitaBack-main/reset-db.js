import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';
import categoryRoutes from './routes/categoryRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/categories', categoryRoutes);
app.use('/markets', marketRoutes);
app.use('/products', productRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue dans l’API produits');
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur backend : http://localhost:${PORT}`);
  });
});









































