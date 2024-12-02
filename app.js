import express from 'express';
import { connectDB } from './db/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

connectDB()
    .then(client => {
        const db = client.db();
        const productsCollection = db.collection('products');

        app.post('/products', async (req, res) => {
            try {
                const newProduct = req.body;
                const result = await productsCollection.insertOne(newProduct);
                res.status(201).json(result.ops[0]);
            } catch (err) {
                res.status(500).json({ error: 'Failed to create product' });
            }
        });

        app.get('/products', async (req, res) => {
            try {
                const products = await productsCollection.find().toArray();
                res.json(products);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch products' });
            }
        });

        app.get('/products/:id', async (req, res) => {
            try {
                const { ObjectId } = await import('mongodb');
                const product = await productsCollection.findOne({ _id: new ObjectId(req.params.id) });
                if (!product) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.json(product);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch product' });
            }
        });

        app.put('/products/:id', async (req, res) => {
            try {
                const { ObjectId } = await import('mongodb');
                const updatedProduct = req.body;
                const result = await productsCollection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: updatedProduct }
                );
                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.json({ message: 'Product updated' });
            } catch (err) {
                res.status(500).json({ error: 'Failed to update product' });
            }
        });

        app.delete('/products/:id', async (req, res) => {
            try {
                const { ObjectId } = await import('mongodb');
                const result = await productsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.json({ message: 'Product deleted' });
            } catch (err) {
                res.status(500).json({ error: 'Failed to delete product' });
            }
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to database', err);
        process.exit(1);
    });