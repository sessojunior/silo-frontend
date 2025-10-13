import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
// Importações locais
import { config, validateConfig, logConfig } from './config.js';
import { cleanupTempFiles } from './utils.js';
// Handlers
import { handleMainUpload, handleAvatarUpload, handleContactUpload, handleProblemUpload, handleSolutionUpload } from './handlers.js';
import { handleFileOptions, handleFileServe, handleFileDelete, handleHealthCheck } from './fileHandlers.js';
// Configuração Multer
import { uploadSingle, uploadMultiple } from './multerConfig.js';
// Configuração
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Validar configuração na inicialização
validateConfig();
logConfig();
// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:', config.nextPublicAppUrl, config.fileServerUrl],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: config.nextPublicAppUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
// Registrar rotas de upload
app.post('/api/upload', uploadSingle, handleMainUpload);
app.post('/upload/avatar', uploadSingle, handleAvatarUpload);
app.post('/upload/contact', uploadSingle, handleContactUpload);
app.post('/upload/problem', uploadMultiple, handleProblemUpload);
app.post('/upload/solution', uploadMultiple, handleSolutionUpload);
// Registrar rotas de arquivos
app.options('/files/:type/:filename', handleFileOptions);
app.get('/files/:type/:filename', handleFileServe);
app.delete('/files/:type/:filename', handleFileDelete);
// Health check
app.get('/health', handleHealthCheck);
// Limpeza automática a cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000);
// Iniciar servidor
app.listen(config.port, () => {
    console.log(`🚀 Servidor de arquivos SILO rodando na porta ${config.port}`);
    console.log(`📁 Uploads em: ${path.join(__dirname, '..', 'uploads')}`);
    console.log(`🔗 URL: ${config.fileServerUrl}`);
    console.log(`🗑️ Limpeza automática de arquivos temporários ativada`);
});
//# sourceMappingURL=server.js.map