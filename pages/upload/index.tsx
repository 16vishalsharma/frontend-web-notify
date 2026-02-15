import React, { useState, useEffect } from 'react';
import { Layout } from '@components/common';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import { uploadService } from '@lib/public/upload/upload.service';
import { IFileListItem } from '@appTypes/index';

const UploadPage: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<IFileListItem[]>([]);

  const loadFiles = async () => {
    try {
      const data = await uploadService.getFiles();
      setFiles(data.files || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const data = await uploadService.uploadSingle(e.target.files[0]);
      if (data.success) {
        setResult(`Uploaded! Worker: ${data.workerId} | Path: ${data.file?.path}`);
        loadFiles();
      } else {
        setError('Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const data = await uploadService.uploadMultiple(e.target.files);
      if (data.success) {
        setResult(`${data.files?.length} file(s) uploaded! Worker: ${data.workerId}`);
        loadFiles();
      } else {
        setError('Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <Typography variant="h1" className="mb-6">File Upload</Typography>

      {uploading && <LinearProgress sx={{ mb: 2 }} />}
      {result && <Alert severity="success" sx={{ mb: 2 }}>{result}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="text-center p-6">
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" className="mb-2">Single File</Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4">Max 10MB</Typography>
            <Button variant="contained" component="label">
              Choose File
              <input type="file" hidden onChange={handleSingleUpload} />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center p-6">
            <CloudUploadIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h3" className="mb-2">Multiple Files</Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4">Max 10 files, 10MB each</Typography>
            <Button variant="contained" color="warning" component="label">
              Choose Files
              <input type="file" hidden multiple onChange={handleMultipleUpload} />
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-3">
            <Typography variant="h2">Uploaded Files</Typography>
            <IconButton onClick={loadFiles}><RefreshIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {files.length > 0 ? (
            <List>
              {files.map((file, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon><InsertDriveFileIcon /></ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" className="text-center py-4">
              No files uploaded yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default UploadPage;
