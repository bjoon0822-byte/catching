import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

import aiRoutes from './routes/ai';

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Catching Backend is running!' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
