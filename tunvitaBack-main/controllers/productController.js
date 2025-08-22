import { Product } from '../models/product.js';
import { Category } from '../models/Category.js';
import { Market } from '../models/Market.js';

export const createProduct = async (req, res) => {
  try {
    const { name, barcode, price, quantity, unit, pricePerUnit, categoryId, marketId, description } = req.body;
    const product = await Product.create({
      name,
      barcode,
      price,
      quantity,
      unit,
      pricePerUnit,
      categoryId,
      marketId,
      description
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllProducts = async (_, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name', 'color'] },
        { model: Market, as: 'Market', attributes: ['id', 'name'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name', 'color'] },
        { model: Market, as: 'Market', attributes: ['id', 'name'] }
      ]
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};