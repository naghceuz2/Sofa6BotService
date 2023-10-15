import KoaBody from 'koa-body';

export const koaBody = KoaBody({
  multipart: true,
  formidable: {
    maxFileSize: 2 * 1024 * 1024,
    onFileBegin: (name, file) => {
      console.log('name', name);
      console.log('file', file);
    }
  }
});

export default koaBody;
