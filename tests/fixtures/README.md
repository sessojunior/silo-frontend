# 📁 Fixtures para Testes Playwright

Este diretório contém arquivos de teste necessários para executar os testes automatizados do projeto Silo.

## 📋 Arquivos Necessários

### 🖼️ Imagens de Teste

Para que os testes de upload funcionem corretamente, você precisa criar os seguintes arquivos:

#### `test-image.jpg`

- **Uso**: Teste de upload de imagens em problemas
- **Tamanho**: Recomendado 1-2MB
- **Formato**: JPG
- **Dimensões**: Qualquer resolução (será redimensionada pelo sistema)

#### `solution-image.jpg`

- **Uso**: Teste de upload de imagens em soluções
- **Tamanho**: Recomendado 1-2MB
- **Formato**: JPG
- **Dimensões**: Qualquer resolução

#### `contact-photo.jpg`

- **Uso**: Teste de upload de fotos de contatos
- **Tamanho**: Recomendado 1-2MB
- **Formato**: JPG
- **Dimensões**: Qualquer resolução

#### `avatar-image.jpg`

- **Uso**: Teste de upload de avatar de usuário
- **Tamanho**: Recomendado 1-2MB
- **Formato**: JPG
- **Dimensões**: Qualquer resolução (será redimensionada para 128x128)

#### `large-file.jpg` (Opcional)

- **Uso**: Teste de validação de tamanho máximo
- **Tamanho**: Maior que 4MB para testar limites
- **Formato**: JPG
- **Dimensões**: Qualquer resolução

## 🚀 Como Criar as Fixtures

### Opção 1: Usar Imagens Existentes

Se você já tem imagens no projeto, pode copiá-las para este diretório:

```bash
# Copiar imagens existentes (se houver)
cp ../public/images/*.jpg ./
```

### Opção 2: Baixar Imagens de Teste

Você pode baixar imagens de teste gratuitas de sites como:

- [Unsplash](https://unsplash.com/)
- [Pexels](https://www.pexels.com/)
- [Pixabay](https://pixabay.com/)

### Opção 3: Criar Imagens Simples

Usar qualquer editor de imagem para criar imagens simples de teste.

## ⚠️ Importante

- **NUNCA** commitar imagens reais ou sensíveis neste diretório
- Use apenas imagens de teste sem conteúdo pessoal
- As imagens devem ser pequenas (1-2MB) para testes rápidos
- O sistema redimensionará automaticamente as imagens conforme necessário

## 🔧 Configuração

Certifique-se de que o diretório `tests/fixtures/` está incluído no `.gitignore` para evitar commitar arquivos de teste:

```gitignore
# Test fixtures
tests/fixtures/*.jpg
tests/fixtures/*.png
tests/fixtures/*.gif
```

## 📝 Notas dos Testes

Os testes verificam:

- ✅ Upload de imagens via servidor local
- ✅ Validação de tamanho máximo
- ✅ Preview de imagens
- ✅ Redimensionamento automático
- ✅ Exclusão de arquivos
- ✅ Fallback para storage local

## 🚨 Solução de Problemas

Se os testes falharem por falta de imagens:

1. Verifique se as imagens estão no diretório correto
2. Confirme se os nomes dos arquivos estão corretos
3. Verifique se as imagens são válidas (não corrompidas)
4. Execute `npm run test:debug` para ver logs detalhados
