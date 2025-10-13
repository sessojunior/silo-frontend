import path from 'path';
import fs from 'fs';
import { config } from './config.js';
/**
 * Handler para preflight OPTIONS de arquivos
 */
export const handleFileOptions = (req, res) => {
    res.header('Access-Control-Allow-Origin', config.nextPublicAppUrl);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(200).end();
};
/**
 * Handler para servir arquivos
 */
export const handleFileServe = (req, res) => {
    const { type, filename } = req.params;
    if (!type || !filename) {
        const errorResponse = { success: false, error: 'Parâmetros inválidos' };
        res.status(400).json(errorResponse);
        return;
    }
    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    // Headers CORS específicos para arquivos
    res.header('Access-Control-Allow-Origin', config.nextPublicAppUrl);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        const errorResponse = { success: false, error: 'Arquivo não encontrado' };
        res.status(404).json(errorResponse);
    }
};
/**
 * Handler para deletar arquivos
 */
export const handleFileDelete = (req, res) => {
    const { type, filename } = req.params;
    if (!type || !filename) {
        const errorResponse = { success: false, error: 'Parâmetros inválidos' };
        res.status(400).json(errorResponse);
        return;
    }
    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Arquivo deletado com sucesso' });
        }
        else {
            const errorResponse = { success: false, error: 'Arquivo não encontrado' };
            res.status(404).json(errorResponse);
        }
    }
    catch (error) {
        console.error('❌ Erro ao deletar arquivo:', error);
        const errorResponse = { success: false, error: 'Erro interno do servidor' };
        res.status(500).json(errorResponse);
    }
};
/**
 * Handler para health check
 */
export const handleHealthCheck = (req, res) => {
    const response = {
        success: true,
        message: 'Servidor de arquivos funcionando',
        timestamp: new Date().toISOString(),
        port: config.port,
    };
    res.json(response);
};
//# sourceMappingURL=fileHandlers.js.map