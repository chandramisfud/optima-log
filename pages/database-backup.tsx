// pages/database-backup.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { withAuth } from '../lib/auth';
import { NextPage } from 'next';
import { getBackupFiles, downloadBackup } from '../lib/api';
import { BackupFile } from '../types/backup';

const DatabaseBackup: NextPage = () => {
  const router = useRouter();
  const { env, platform } = router.query;
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackupFiles = async () => {
    if (!env || !platform) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getBackupFiles(env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', date);
      setBackupFiles(response.data);
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to fetch backup files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile || !env || !platform) return;
    setLoading(true);
    setError(null);
    try {
      const response = await downloadBackup(env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', date, selectedFile);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download backup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupFiles();
  }, [date, env, platform]);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Database Backup ({env === 'dev' ? 'Development' : 'Production'} - {platform})
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
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Backup Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {backupFiles.length === 0 ? (
                  <p className="text-gray-500">No backup files found for this date.</p>
                ) : (
                  backupFiles.map((file) => (
                    <div key={file.file_name} className="flex items-center">
                      <input
                        type="radio"
                        name="backupFile"
                        value={file.file_name}
                        checked={selectedFile === file.file_name}
                        onChange={() => setSelectedFile(file.file_name)}
                        className="mr-2"
                      />
                      <label className="text-gray-700">{file.file_name}</label>
                    </div>
                  ))
                )}
              </div>
            </div>
            {selectedFile && (
              <div className="mb-4">
                <button
                  onClick={handleDownload}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  Download
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(DatabaseBackup);