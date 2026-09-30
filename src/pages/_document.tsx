import Document, { Head, Html, Main, NextScript } from 'next/document';

import { AppConfig } from '../config/appConfig';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

class MyDocument extends Document {
  render() {
    const isProd = process.env.NODE_ENV === 'production' && GA_ID;

    const gtagScript = isProd
      ? `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
      `
      : '';

    return (
      <Html lang={AppConfig.locale}>
        <Head>
          {isProd ? (
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
          ) : null}
          <script
            dangerouslySetInnerHTML={{
              __html: gtagScript,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
