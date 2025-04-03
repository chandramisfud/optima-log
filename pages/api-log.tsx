// pages/api-log.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { withAuth } from '../lib/auth';
import { NextPage } from 'next';
import { getLogFiles, getLogContent, searchLogs, downloadLogs } from '../lib/api';
import { LogFile, LogSearchResult } from '../types/log';

const APILog: NextPage = () => {
  const router = useRouter();
  const { env, platform } = router.query;
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LogSearchResult[]>([]);
  const [fontSize, setFontSize] = useState<number>(14);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogFiles = async () => {
    if (!env || !platform) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getLogFiles(date, 'api', env as 'dev' | 'prod', platform as 'XVA' | 'DANONE');
      setLogFiles(response.data.files);
      setSelectedFile(null);
      setLogContent('');
      setSearchResults([]);
    } catch (err) {
      setError('Failed to fetch log files');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogContent = async (file: string) => {
    if (!env || !platform) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getLogContent('api', date, env as 'dev' | 'prod', file, platform as 'XVA' | 'DANONE');
      setLogContent(response.data);
      if (searchKeyword) {
        await searchInLogs();
      }
    } catch (err) {
      setError('Failed to fetch log content');
    } finally {
      setLoading(false);
    }
  };

  const searchInLogs = async () => {
    if (!env || !platform || !searchKeyword) return;
    setLoading(true);
    setError(null);
    try {
      const response = await searchLogs(date, 'api', env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', searchKeyword);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to search logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile || !env || !platform) return;
    setLoading(true);
    setError(null);
    try {
      const response = await downloadLogs('api', date, env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', [selectedFile]);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logs.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogFiles();
  }, [date, env, platform]);

  useEffect(() => {
    if (selectedFile) {
      fetchLogContent(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (searchKeyword) {
      searchInLogs();
    } else {
      setSearchResults([]);
    }
  }, [searchKeyword]);

  const highlightSearchResults = (text: string) => {
    if (!searchKeyword || !searchResults.length) return text;
    let highlightedText = text;
    searchResults.forEach((result) => {
      const regex = new RegExp(`(${searchKeyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="bg-yellow-200">$1</span>');
    });
    return highlightedText;
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          API Log ({env === 'dev' ? 'Development' : 'Production'} - {platform})
        </h1>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Choose Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        {loading && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!loading && !error && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Log Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logFiles.length === 0 ? (
                  <p className="text-gray-500">No log files found for this date.</p>
                ) : (
                  logFiles.map((file) => (
                    <div key={file.name} className="flex items-center">
                      <input
                        type="radio"
                        name="logFile"
                        value={file.name}
                        checked={selectedFile === file.name}
                        onChange={() => setSelectedFile(file.name)}
                        className="mr-2"
                      />
                      <label className="text-gray-700">{file.name}</label>
                    </div>
                  ))
                )}
              </div>
            </div>
            {selectedFile && (
              <>
                <div className="mb-4 flex items-center space-x-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Search</label>
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="p-2 border rounded"
                      placeholder="Enter keyword..."
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="p-2 border rounded"
                    >
                      <option value={12}>12px</option>
                      <option value={14}>14px</option>
                      <option value={16}>16px</option>
                      <option value={18}>18px</option>
                      <option value={20}>20px</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-6 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    Download
                  </button>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <pre
                    className="whitespace-pre-wrap"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: highlightSearchResults(logContent) }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(APILog);