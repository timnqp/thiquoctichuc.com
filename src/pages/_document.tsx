import Document, { Head, Html, Main, NextScript } from 'next/document';

import { AppConfig } from '../config/appConfig';

class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
