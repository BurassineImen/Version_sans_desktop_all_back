import { sequelize, Category, Product } from '../models/index.js';
import { Sequelize } from 'sequelize';

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllCategories = async (_, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        'color',
        'description',
        [sequelize.fn('COUNT', sequelize.col('Products.id')), 'count']
      ],
      include: [
        {
          model: Product,
          as: 'Products',
          attributes: [],
          required: false // LEFT JOIN to include categories with 0 products
        }
      ],
      group: ['Category.id', 'Category.name', 'Category.color', 'Category.description'],
      order: [[sequelize.literal('count'), 'DESC']],
  
      subQuery: false // Prevent subquery to simplify SQL
  });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMostUsedCategories = async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        'color',
        'description',
        [sequelize.fn('COUNT', sequelize.col('Products.id')), 'count']
      ],
      include: [
        {
          model: Product,
          as: 'Products',
          attributes: [],
          required: false // LEFT JOIN to include categories with 0 products
        }
      ],
      group: ['Category.id', 'Category.name', 'Category.color', 'Category.description'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
      subQuery: false // Prevent subquery to simplify SQL
    });

    // Transform the result to match frontend expectations
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      description: cat.description,
      count: parseInt(cat.getDataValue('count')) || 0
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Erreur getMostUsedCategories:', error);
    res.status(500).json({ error: 'Failed to fetch most used categories', details: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate categoryId
    if (!categoryId || isNaN(parseInt(categoryId))) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const products = await Product.findAll({
      where: { categoryId: parseInt(categoryId) },
      include: [
        { model: Category, attributes: ['id', 'name', 'color'], as: 'Category' }
      ],
      order: [['id', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryProductCount = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    if (!categoryId || isNaN(parseInt(categoryId))) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const count = await Product.count({
      where: { categoryId: parseInt(categoryId) }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error counting products:', error);
    res.status(500).json({ error: 'Failed to count products', details: error.message });
  }
};

export const updateCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};