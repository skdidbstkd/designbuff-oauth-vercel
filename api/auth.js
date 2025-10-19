// api/auth.js
import { github } from 'decap-cms-oauth-provider-node';

export default github({
  client_id: process.env.OAUTH_CLIENT_ID,
  client_secret: process.env.OAUTH_CLIENT_SECRET
});
