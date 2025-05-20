import { app } from './app';
import { env } from './env';

app
  .listen({
    host: '0.0.0.0', // This is required on Render
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running on http://localhost:3333');
  });
