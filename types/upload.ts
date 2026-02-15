export interface IUploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface IUploadResponse {
  success: boolean;
  message: string;
  workerId: number;
  file?: IUploadedFile;
  files?: IUploadedFile[];
}

export interface IFileListItem {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}
