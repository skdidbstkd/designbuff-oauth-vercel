
DesignBuff - Static site package
Contents:
- index.html
- style.css
- form.js
- assets/ (logo and sample photos)

Quick deploy (Netlify - free):
1. Go to https://app.netlify.com/drop
2. Drag & drop the entire folder (this zip) onto the page
3. Netlify will upload and publish a free site with a random subdomain. Use "Site settings" > "Domain settings" to change later.

Quick use on Webflow (Embed method):
1. Create a new Blank site in Webflow (Dashboard > New Site > Blank)
2. Open the Designer for the site.
3. On the left, open +Add -> Components -> Embed and drag into the page canvas.
4. Open the embed code and paste the CONTENT of index.html (the inner HTML of <body>) into the embed, wrapped in a container if desired.
5. For CSS, open Project Settings > Custom Code > Head code and paste the content of style.css inside a <style> tag.
6. For JS, paste form.js content into Footer Custom Code or add a second embed at page bottom with <script>...</script>.
7. Publish the Webflow site (Publish button). Note: Webflow Starter may limit some embed features; Netlify is the most straightforward free hosting.

Editing content:
- Replace assets/* images with your own photos (keep same filenames or adjust file paths in index.html)
- Edit text in index.html directly (or edit in Webflow Designer after import)

Contact:
- If you want, I can adapt this package to a CMS (Netlify CMS) or provide a step-by-step screen-by-screen guide for Webflow Designer editing.

