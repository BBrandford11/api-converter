'use client';

import { useState } from 'react';
import { ConversionType } from '../src/lib/types/conversion-types';

async function convertDocument(request: {
  document: string;
  fromFormat: string;
  toFormat: string;
  separators?: { segment: string; element: string };
}) {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert document');
  }

  return response.json();
}

export default function Home() {
  const [document, setDocument] = useState('');
  const [fromFormat, setFromFormat] = useState<ConversionType>(ConversionType.STRING);
  const [toFormat, setToFormat] = useState<ConversionType>(ConversionType.JSON);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await convertDocument({
        document,
        fromFormat,
        toFormat,
        ...(fromFormat === ConversionType.STRING || toFormat === ConversionType.STRING
          ? {
              separators: {
                segment: '~',
                element: '*',
              },
            }
          : {}),
      });

      setResult(typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col py-16 px-8">
        <h1 className="mb-8 text-3xl font-semibold text-black dark:text-zinc-50">
          Document Converter
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 space-y-6">
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document
            </label>
            <textarea
              id="document"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="w-full h-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Enter your document here..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Format
              </label>
              <select
                id="fromFormat"
                value={fromFormat}
                onChange={(e) => setFromFormat(e.target.value as ConversionType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value={ConversionType.STRING}>STRING</option>
                <option value={ConversionType.JSON}>JSON</option>
                <option value={ConversionType.XML}>XML</option>
              </select>
            </div>

            <div>
              <label htmlFor="toFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Format
              </label>
              <select
                id="toFormat"
                value={toFormat}
                onChange={(e) => setToFormat(e.target.value as ConversionType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value={ConversionType.STRING}>STRING</option>
                <option value={ConversionType.JSON}>JSON</option>
                <option value={ConversionType.XML}>XML</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">Result:</h2>
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md overflow-auto text-sm">
              <code className="text-gray-800 dark:text-gray-200">{result}</code>
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
