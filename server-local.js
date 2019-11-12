'use strict';

const app = require('./expressServer/server');

app.listen(3000, () => console.log('Local app listening on port 3000!'));
