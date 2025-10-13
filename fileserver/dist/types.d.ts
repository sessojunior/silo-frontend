import { Request, Response } from 'express';
export interface UploadResponse {
    key: string;
    name: string;
    size: number;
    url: string;
    id: string;
    status: 'uploaded';
    optimized: boolean;
}
export interface MultiUploadResponse {
    success: boolean;
    message: string;
    data: UploadResponse[];
}
export interface SingleUploadResponse {
    success: boolean;
    message: string;
    data: UploadResponse;
}
export interface ErrorResponse {
    success: false;
    error: string;
}
export interface HealthCheckResponse {
    success: true;
    message: string;
    timestamp: string;
    port: number;
}
export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export type ExpressHandler = (req: Request, res: Response) => Promise<void> | void;
export type ExpressHandlerSync = (req: Request, res: Response) => void;
export interface OptimizationConfig {
    avatar: {
        thumbnailSize: number;
        thumbnailQuality: number;
    };
    profile: {
        size: number;
        quality: number;
    };
    general: {
        maxWidth: number;
        maxHeight: number;
        quality: number;
    };
}
export interface UploadConfig {
    maxFileSize: number;
    maxFilesCount: number;
    allowedExtensions: string[];
    allowedMimes: string[];
}
export interface FileServerConfig {
    port: number;
    fileServerUrl: string;
    nextPublicAppUrl: string;
    upload: UploadConfig;
    optimization: OptimizationConfig;
}
//# sourceMappingURL=types.d.ts.map