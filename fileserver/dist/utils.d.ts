/**
 * Gera nome único para arquivo baseado no nome original
 * @param originalName - Nome original do arquivo
 * @returns Nome único gerado
 */
export declare function generateUniqueFilename(originalName: string): string;
/**
 * Valida tipo de arquivo usando file-type para maior segurança
 * @param buffer - Buffer do arquivo
 * @returns Promise<boolean> - true se válido, false caso contrário
 */
export declare function validateFileType(buffer: Buffer): Promise<boolean>;
/**
 * Gera thumbnail para avatar (baseado no código existente do SILO)
 * @param buffer - Buffer da imagem
 * @param filename - Nome do arquivo
 * @returns Promise<string | null> - URL do thumbnail ou null se erro
 */
export declare function generateThumbnail(buffer: Buffer, filename: string): Promise<string | null>;
/**
 * Otimiza imagem geral (baseada no código existente do SILO)
 * @param buffer - Buffer da imagem
 * @param filename - Nome do arquivo
 * @param type - Tipo de upload (general, problems, solutions, etc.)
 * @returns Promise<string | null> - URL da imagem otimizada ou null se erro
 */
export declare function optimizeImage(buffer: Buffer, filename: string, type?: string): Promise<string | null>;
/**
 * Gera imagem de perfil (baseada em profileImage.ts)
 * @param buffer - Buffer da imagem
 * @param userId - ID do usuário
 * @returns Promise<string | null> - URL da imagem de perfil ou null se erro
 */
export declare function generateProfileImage(buffer: Buffer, userId: string): Promise<string | null>;
/**
 * Cria diretório se não existir
 * @param dirPath - Caminho do diretório
 */
export declare function ensureDirectoryExists(dirPath: string): void;
/**
 * Limpa arquivos antigos de um diretório específico
 * @param dirPath - Caminho do diretório
 * @param extension - Extensão dos arquivos a serem removidos (ex: '.webp')
 */
export declare function cleanupOldFiles(dirPath: string, extension: string): void;
/**
 * Limpeza automática de arquivos temporários
 */
export declare function cleanupTempFiles(): void;
//# sourceMappingURL=utils.d.ts.map