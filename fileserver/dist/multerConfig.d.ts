import multer from 'multer';
/**
 * Configuração do Multer com validações
 */
export declare const upload: multer.Multer;
/**
 * Middleware para upload único
 */
export declare const uploadSingle: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Middleware para upload múltiplo
 */
export declare const uploadMultiple: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=multerConfig.d.ts.map