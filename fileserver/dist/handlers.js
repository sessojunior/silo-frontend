import path from 'path';
import sharp from 'sharp';
import { config } from './config.js';
import { generateUniqueFilename, validateFileType, optimizeImage, ensureDirectoryExists, cleanupOldFiles } from './utils.js';
/**
 * Handler para upload genérico
 */
export const handleMainUpload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            const errorResponse = { success: false, error: 'Nenhum arquivo enviado' };
            res.status(400).json(errorResponse);
            return;
        }
        // Validar tipo de arquivo
        const isValidType = await validateFileType(file.buffer);
        if (!isValidType) {
            const errorResponse = { success: false, error: 'Tipo de arquivo não permitido' };
            res.status(400).json(errorResponse);
            return;
        }
        // Gerar nome único
        const filename = generateUniqueFilename(file.originalname);
        const uploadDir = path.join(process.cwd(), 'uploads', 'general');
        // Garantir que diretório existe
        ensureDirectoryExists(uploadDir);
        // Otimizar imagem automaticamente (baseado no código existente)
        const optimizedUrl = await optimizeImage(file.buffer, filename, 'general');
        const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';
        const fileUrl = optimizedUrl || `${config.fileServerUrl}/files/general/${optimizedFilename}`;
        // Resposta padronizada
        const response = {
            key: optimizedFilename,
            name: file.originalname,
            size: file.size,
            url: fileUrl,
            // Campos adicionais
            id: optimizedFilename,
            status: 'uploaded',
            optimized: !!optimizedUrl, // Indica se foi otimizada
        };
        console.log('✅ Upload concluído:', optimizedFilename);
        res.json(response);
    }
    catch (error) {
        console.error('❌ Erro no upload:', error);
        const errorResponse = { success: false, error: 'Erro interno do servidor' };
        res.status(500).json(errorResponse);
    }
};
/**
 * Handler para upload de avatar
 */
export const handleAvatarUpload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            const errorResponse = { success: false, error: 'Nenhum arquivo enviado' };
            res.status(400).json(errorResponse);
            return;
        }
        const isValidType = await validateFileType(file.buffer);
        if (!isValidType) {
            const errorResponse = { success: false, error: 'Tipo de arquivo não permitido' };
            res.status(400).json(errorResponse);
            return;
        }
        const filename = generateUniqueFilename(file.originalname);
        const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
        ensureDirectoryExists(uploadDir);
        // Limpar avatars anteriores (manter apenas o mais recente)
        cleanupOldFiles(uploadDir, '.webp');
        // Gerar avatar quadrado otimizado (baseado em src/lib/profileImage.ts)
        const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';
        const optimizedPath = path.join(uploadDir, optimizedFilename);
        const avatarSize = config.optimization.profile.size;
        const avatarQuality = config.optimization.profile.quality;
        await sharp(file.buffer)
            .rotate() // Rotação automática baseada em EXIF
            .resize(avatarSize, avatarSize, { fit: 'cover' }) // Quadrado com crop
            .webp({ quality: avatarQuality })
            .toFile(optimizedPath);
        const fileUrl = `${config.fileServerUrl}/files/avatars/${optimizedFilename}`;
        const response = {
            success: true,
            message: 'Upload de avatar concluído com sucesso!',
            data: {
                key: optimizedFilename,
                name: file.originalname,
                size: file.size,
                url: fileUrl,
                id: optimizedFilename,
                status: 'uploaded',
                optimized: true,
            },
        };
        console.log('✅ Avatar upload concluído:', optimizedFilename);
        res.json(response);
    }
    catch (error) {
        console.error('❌ Erro no upload de avatar:', error);
        const errorResponse = { success: false, error: 'Erro interno do servidor' };
        res.status(500).json(errorResponse);
    }
};
/**
 * Handler para upload de contato
 */
export const handleContactUpload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            const errorResponse = { success: false, error: 'Nenhum arquivo enviado' };
            res.status(400).json(errorResponse);
            return;
        }
        const isValidType = await validateFileType(file.buffer);
        if (!isValidType) {
            const errorResponse = { success: false, error: 'Tipo de arquivo não permitido' };
            res.status(400).json(errorResponse);
            return;
        }
        const filename = generateUniqueFilename(file.originalname);
        const uploadDir = path.join(process.cwd(), 'uploads', 'contacts');
        ensureDirectoryExists(uploadDir);
        // Limpar imagens anteriores de contatos (manter apenas a mais recente)
        cleanupOldFiles(uploadDir, '.webp');
        // Gerar imagem quadrada otimizada (igual ao avatar)
        const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';
        const optimizedPath = path.join(uploadDir, optimizedFilename);
        const contactSize = config.optimization.profile.size;
        const contactQuality = config.optimization.profile.quality;
        await sharp(file.buffer)
            .rotate() // Rotação automática baseada em EXIF
            .resize(contactSize, contactSize, { fit: 'cover' }) // Quadrado com crop
            .webp({ quality: contactQuality })
            .toFile(optimizedPath);
        const fileUrl = `${config.fileServerUrl}/files/contacts/${optimizedFilename}`;
        const response = {
            success: true,
            message: 'Upload de contato concluído com sucesso!',
            data: {
                key: optimizedFilename,
                name: file.originalname,
                size: file.size,
                url: fileUrl,
                id: optimizedFilename,
                status: 'uploaded',
                optimized: true,
            },
        };
        console.log('✅ Contato upload concluído:', optimizedFilename);
        res.json(response);
    }
    catch (error) {
        console.error('❌ Erro no upload de contato:', error);
        const errorResponse = { success: false, error: 'Erro interno do servidor' };
        res.status(500).json(errorResponse);
    }
};
/**
 * Handler para upload múltiplo de problemas
 */
export const handleProblemUpload = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            const errorResponse = { success: false, error: 'Nenhum arquivo enviado' };
            res.status(400).json(errorResponse);
            return;
        }
        const uploadedFiles = [];
        const uploadDir = path.join(process.cwd(), 'uploads', 'problems');
        ensureDirectoryExists(uploadDir);
        for (const file of files) {
            const isValidType = await validateFileType(file.buffer);
            if (!isValidType) {
                continue; // Pular arquivos inválidos
            }
            const filename = generateUniqueFilename(file.originalname);
            // Otimizar imagem automaticamente
            const optimizedUrl = await optimizeImage(file.buffer, filename, 'problems');
            const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';
            const fileUrl = optimizedUrl || `${config.fileServerUrl}/files/problems/${optimizedFilename}`;
            uploadedFiles.push({
                key: optimizedFilename,
                name: file.originalname,
                size: file.size,
                url: fileUrl,
                id: optimizedFilename,
                status: 'uploaded',
                optimized: !!optimizedUrl, // Indica se foi otimizada
            });
        }
        const response = {
            success: true,
            message: `${uploadedFiles.length} arquivo(s) de problema enviado(s) com sucesso!`,
            data: uploadedFiles,
        };
        console.log('✅ Problema upload concluído:', uploadedFiles.length, 'arquivos');
        res.json(response);
    }
    catch (error) {
        console.error('❌ Erro no upload de problema:', error);
        const errorResponse = { success: false, error: 'Erro interno do servidor' };
        res.status(500).json(errorResponse);
    }
};
/**
 * Handler para upload múltiplo de soluções
 */
export const handleSolutionUpload = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            const errorResponse = { success: false, error: 'Nenhum arquivo enviado' };
            res.status(400).json(errorResponse);
            return;
        }
        const uploadedFiles = [];
        const uploadDir = path.join(process.cwd(), 'uploads', 'solutions');
        ensureDirectoryExists(uploadDir);
        for (const file of files) {
            const isValidType = await validateFileType(file.buffer);
            if (!isValidType) {
                continue; // Pular arquivos inválidos
            }
            const filename = generateUniqueFilename(file.originalname);
            // Otimizar imagem automaticamente
            const optimizedUrl = await optimizeImage(file.buffer, filename, 'solutions');
            const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';
            const fileUrl = optimizedUrl || `${config.fileServerUrl}/files/solutions/${optimizedFilename}`;
            uploadedFiles.push({
                key: optimizedFilename,
                name: file.originalname,
                size: file.size,
                url: fileUrl,
                id: optimizedFilename,
                status: 'uploaded',
                optimized: !!optimizedUrl, // Indica se foi otimizada
            });
        }
        const response = {
            success: true,
            message: `${uploadedFiles.length} arquivo(s) de solução enviado(s) com sucesso!`,
            data: uploadedFiles,
        };
        console.log('✅ Solução upload concluído:', uploadedFiles.length, 'arquivos');
        res.json(response);
    }
    catch (error) {
        console.error('❌ Erro no upload de solução:', error);
        const errorResponse = { success: false, error: 'Erro interno do servidor' };
        res.status(500).json(errorResponse);
    }
};
//# sourceMappingURL=handlers.js.map