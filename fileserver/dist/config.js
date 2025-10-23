// Configuração centralizada do servidor de arquivos
// TODAS as configurações estão aqui - não precisa de arquivo .env
export const config = {
    // Configurações básicas do servidor
    port: 4000,
    fileServerUrl: process.env.FILE_SERVER_URL || 'http://localhost:4000',
    nextPublicAppUrl: process.env.APP_URL || 'http://localhost:3000',
    // Configurações de upload
    upload: {
        maxFileSize: 4194304, // 4MB
        maxFilesCount: 3,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    // Configurações de otimização de imagens
    optimization: {
        // Avatars (baseado no código existente)
        avatar: {
            thumbnailSize: 128,
            thumbnailQuality: 85
        },
        // Profile Images (baseado no código existente)
        profile: {
            size: 80,
            quality: 85
        },
        // Otimização geral
        general: {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 90
        }
    }
};
// Validação básica da configuração
export function validateConfig() {
    if (config.port < 1 || config.port > 65535) {
        throw new Error('Porta deve estar entre 1 e 65535');
    }
    if (config.upload.maxFileSize < 1024) {
        throw new Error('Tamanho máximo de arquivo deve ser pelo menos 1KB');
    }
    if (config.upload.maxFilesCount < 1) {
        throw new Error('Número máximo de arquivos deve ser pelo menos 1');
    }
    // Validar URLs
    try {
        new URL(config.fileServerUrl);
        new URL(config.nextPublicAppUrl);
    }
    catch (error) {
        throw new Error('URLs de configuração inválidas');
    }
    console.log('✅ Configuração validada com sucesso');
}
// Log da configuração atual (sem dados sensíveis)
export function logConfig() {
    console.log('🔧 Configuração do FileServer:');
    console.log(`   Porta: ${config.port}`);
    console.log(`   File Server URL: ${config.fileServerUrl}`);
    console.log(`   Next App URL: ${config.nextPublicAppUrl}`);
    console.log(`   Max File Size: ${config.upload.maxFileSize} bytes`);
    console.log(`   Max Files Count: ${config.upload.maxFilesCount}`);
    console.log(`   Allowed Extensions: ${config.upload.allowedExtensions.join(', ')}`);
    console.log(`   Avatar Thumbnail Size: ${config.optimization.avatar.thumbnailSize}px`);
    console.log(`   Profile Image Size: ${config.optimization.profile.size}px`);
    console.log(`   General Max Size: ${config.optimization.general.maxWidth}x${config.optimization.general.maxHeight}`);
}
//# sourceMappingURL=config.js.map