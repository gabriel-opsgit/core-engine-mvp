'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Algo deu errado!</h2>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </body>
    </html>
  );
}
