import 'dotenv/config';
import app from './app';
import { testDbConnection } from './config/db';

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Marlibu API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();