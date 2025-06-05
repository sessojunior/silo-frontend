/**
 * Transforma uma string em um slug seguro:
 * - Remove acentos (á, à, â, ã, ä, etc)
 * - Converte espaços em hífens
 * - Remove pontuações e símbolos especiais
 * - Mantém apenas letras [a-z], números [0-9] e hífens
 * - Exemplos:
 *   - formatSlug('Olá, mundo!') // "ola-mundo"
 *   - formatSlug('Àrvore com Ç e São João') // "arvore-com-c-e-sao-joao"
 *   - formatSlug('Espaço     em    excesso') // "espaco-em-excesso"
 *   - formatSlug('CRÁSE, TIL, CIRCUNFLEXO & TREMA üâêîôû') // "crase-til-circunflexo-trema-uaeiou"
 *   - formatSlug('AÇ~2[SDFA$%32;FD@`DFAF[}}³£¢54£5FGDSG') // "ac2sdfa32fddfaf545fgdsg"
 */
export function formatSlug(input: string): string {
	return input
		.normalize('NFD') // separa caracteres de acentos (ex: á → a + ́)
		.replace(/[\u0300-\u036f]/g, '') // remove os diacríticos combinados
		.replace(/[^a-zA-Z0-9\s-]/g, '') // remove qualquer outro caractere que não seja letra, número, espaço ou hífen
		.toLowerCase() // letras minúsculas
		.trim() // remove espaços no início/fim
		.replace(/\s+/g, '-') // espaços internos viram hífens
		.replace(/-+/g, '-') // hífens duplos/triplos viram um só
}
