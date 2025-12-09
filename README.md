# Formulário de Briefing para Identidade Visual de Barbearia

Este projeto consiste em um formulário web simples (HTML, CSS e JavaScript) que coleta dados de um briefing e os envia para uma planilha do Google Sheets, disparando uma notificação por e-mail.

## ESTRUTURA DO PROJETO

| Arquivo | Função |
| :--- | :--- |
| `index.html` | Estrutura principal do formulário com todas as perguntas. |
| `style.css` | Estilização básica para tornar o formulário agradável e responsivo. |
| `script.js` | Lógica do formulário, tratamento de campos condicionais e função de envio de dados. **(Necessita de edição)** |
| `google_apps_script.js` | Código do "backend" que deve ser configurado no Google Sheets. **(Necessita de configuração)** |

---

## 1. CONFIGURAÇÃO DO GOOGLE SHEETS (BACKEND)

Esta é a parte mais importante para a integração funcionar. Siga os passos com atenção.

### 1.1. Preparação da Planilha

1.  **Planilha:** Use a planilha com o ID: `1g5RNsnPkS4SjuExmoFNW_fHJGGn6eAf-4sC7MaylLHQ`.
2.  **Cabeçalhos:** **CRUCIAL!** Certifique-se de que a **primeira linha** da sua planilha (aba 1) contenha os cabeçalhos das colunas exatamente como as perguntas do formulário. O script espera que os nomes dos campos do formulário correspondam aos cabeçalhos da planilha.
    *   **Dica:** Adicione uma coluna chamada `Timestamp` no início para registrar a data e hora do envio.

### 1.2. Configuração do Google Apps Script

1.  **Abra o Editor:** Na sua planilha do Google Sheets, vá em **Extensões** -> **Apps Script**.
2.  **Copie o Código:** Copie todo o conteúdo do arquivo `google_apps_script.js` e cole no editor do Apps Script, substituindo o código existente.
3.  **Configure as Variáveis:** No topo do script, edite as seguintes linhas:
    *   `const SPREADSHEET_ID = '1g5RNsnPkS4SjuExmoFNW_fHJGGn6eAf-4sC7MaylLHQ';` (Já está preenchido com o seu ID).
    *   `const EMAIL_DESTINATARIO = 'jvbartk0@gmail.com';` (Já está preenchido com o seu e-mail).
4.  **Salve o Projeto:** Clique no ícone de disquete (Salvar projeto).

### 1.3. Implantação do Aplicativo Web (Obtendo o URL)

Este passo irá gerar o URL que conecta o seu formulário ao Google Sheets.

1.  **Inicie a Implantação:** Clique em **Implantar** (Deploy) -> **Nova implantação** (New deployment).
2.  **Selecione o Tipo:**
    *   Em **Tipo de implantação** (Select type), escolha **Aplicativo da Web** (Web app).
3.  **Configure os Detalhes:**
    *   Em **Descrição** (Description), coloque um nome (ex: "Formulário Briefing Barbearia").
    *   Em **Executar como** (Execute as), selecione **Eu** (Seu e-mail).
    *   Em **Quem tem acesso** (Who has access), selecione **Qualquer pessoa** (Anyone).
4.  **Implante:** Clique em **Implantar** (Deploy).
5.  **Autorização (Apenas na primeira vez):**
    *   O Google pedirá permissão. Clique em **Autorizar acesso** e siga os passos para conceder as permissões necessárias (o script precisa de permissão para escrever na planilha e enviar e-mails em seu nome).
6.  **Copie o URL:** Após a implantação, será exibido o **URL do Aplicativo da Web** (Web app URL). **COPIE ESTE URL COMPLETO.**

---

## 2. INTEGRAÇÃO DO FRONTEND (script.js)

Agora você precisa conectar o formulário web ao seu Google Apps Script.

1.  **Abra o Arquivo:** Abra o arquivo `script.js` em um editor de texto.
2.  **Localize a Variável:** Encontre a linha que define a variável `SCRIPT_URL`:
    ```javascript
    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; 
    ```
3.  **Substitua o URL:** **Substitua** `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` pelo **URL do Aplicativo da Web** que você copiou no passo 1.3.
    *   **Exemplo:** `const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';`

---

## 3. UTILIZAÇÃO

Após a integração, basta hospedar os arquivos `index.html`, `style.css` e o `script.js` em qualquer servidor web (pode ser um serviço de hospedagem gratuita, GitHub Pages, ou até mesmo no seu computador para testes).

Ao preencher e enviar o formulário:
*   Os dados serão salvos na sua planilha.
*   Você receberá um e-mail em `jvbartk0@gmail.com` com o nome da barbearia no assunto e um link direto para a linha da resposta na planilha.

---

## CÓDIGO DOS ARQUIVOS (Para Referência)

O conteúdo completo dos arquivos `index.html`, `style.css`, `script.js` e `google_apps_script.js` está disponível neste pacote.
\`
