import express from 'express'

const app = express();
const listener = app.listen(process.env.PORT || 8080, () => console.log(`listen on ${listener.address().port}`));

app.get('/', () => {});
