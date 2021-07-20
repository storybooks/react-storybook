import express from 'express';
import serveStatic from 'serve-static';
import { Server } from 'http';

export const serve = async (location: string, port: string): Promise<Server> =>
  new Promise((resolve) => {
    const app = express();

    app.use(serveStatic(location));
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
