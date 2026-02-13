import app from '../wecare-backend/src/index';

export default async function handler(req, res) {
  // Pass the request and response to the Express app
  return app(req, res);
}
