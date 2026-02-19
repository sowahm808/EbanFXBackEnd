import app from './index';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Eban FX backend listening on port ${port}`);
});
