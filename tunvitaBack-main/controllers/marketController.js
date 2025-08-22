import {Market} from '../models/Market.js';

export const createMarket = async (req, res) => {
 try {
    const market = await Market.create(req.body);
    res.status(201).json(market);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  export const getAllMarkets = async (_, res) => {
  try {
    const markets = await Market.findAll();
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getMarketById = async (_, res) => {
     try {
    const market = await Market.findByPk(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};
export const updateMarketById = async (_, res) => {
     try {
    const market = await Market.findByPk(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    await market.update(req.body);
    res.json(market);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const deleteMarketById = async (_, res) => {
  try {
    const market = await Market.findByPk(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    await market.destroy();
    res.json({ message: 'Market deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};