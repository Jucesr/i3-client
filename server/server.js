const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const publicPath = path.join(__dirname,'..','public');

app.use(express.static(publicPath));

// const middleware = (req, res, next) => {
//     req.url = req.url + '.gz';
//     res.set('Content-Encoding', 'gzip');
//     next();
// };
//
// app.get('/dist/bundle.js', middleware, (req, res) => {
//   res.sendFile(publicPath + req.url);
// });
//
// app.get('/dist/bundle.js.map', (req, res) => {
//   res.sendFile(publicPath + req.url);
// });
//
// app.get('/dist/styles.css', (req, res) => {
//   res.sendFile(publicPath + req.url);
// });
// app.get('/images/*', (req, res) => {
//   res.sendFile(publicPath + req.url);
// });


app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});


app.listen(port, ()=> {
  console.log(`Server runing in ${port}`);
});
