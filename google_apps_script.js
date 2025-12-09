/**
 * Google Apps Script para receber dados de um formulário web,
 * salvar em uma planilha e enviar um e-mail de notificação.
 *
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 1. Abra sua planilha do Google Sheets.
 * 2. Vá em 'Extensões' -> 'Apps Script'.
 * 3. Copie e cole todo este código no editor do Apps Script, substituindo o código existente.
 * 4. Substitua os valores das variáveis SPREADSHEET_ID e EMAIL_DESTINATARIO.
 * 5. Salve o projeto (Ctrl+S ou ícone de disquete).
 * 6. Publique o script como um aplicativo da web:
 *    - Clique em 'Implantar' (Deploy) -> 'Nova implantação' (New deployment).
 *    - Em 'Tipo de implantação' (Select type), escolha 'Aplicativo da Web' (Web app).
 *    - Em 'Descrição' (Description), coloque algo como 'Formulário Briefing Barbearia'.
 *    - Em 'Executar como' (Execute as), selecione 'Eu' (My self - seu e-mail).
 *    - Em 'Quem tem acesso' (Who has access), selecione 'Qualquer pessoa' (Anyone).
 *    - Clique em 'Implantar' (Deploy).
 *    - O Google pedirá permissão. Clique em 'Autorizar acesso' e siga os passos.
 *    - Copie o 'URL do aplicativo da web' (Web app URL). ESTE É O URL QUE VOCÊ DEVE COLAR NO ARQUIVO script.js DO SEU FORMULÁRIO.
 */

// **PASSO 4: SUBSTITUA ESTE ID PELO ID DA SUA PLANILHA**
const SPREADSHEET_ID = '1g5RNsnPkS4SjuExmoFNW_fHJGGn6eAf-4sC7MaylLHQ'; 

// **PASSO 4: SUBSTITUA ESTE E-MAIL PELO SEU E-MAIL DE DESTINO**
const EMAIL_DESTINATARIO = 'jvbartk0@gmail.com'; 

/**
 * Função principal que recebe a requisição POST do formulário.
 * @param {Object} e - Objeto de evento da requisição.
 */
function doPost(e) {
    try {
        // 1. Receber e parsear os dados JSON
        const data = JSON.parse(e.postData.contents);
        
        // 2. Abrir a planilha e a aba ativa (Sheet1)
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheets()[0]; // Assume que a primeira aba é a correta
        
        // 3. Obter os cabeçalhos da primeira linha
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // 4. Mapear os dados recebidos para a ordem dos cabeçalhos
        const rowData = headers.map(header => {
            // O nome do campo no formulário deve ser o mesmo do cabeçalho
            return data[header] !== undefined ? data[header] : '';
        });
        
        // 5. Adicionar a nova linha à planilha
        sheet.appendRow(rowData);
        
        // 6. Obter o número da linha recém-adicionada
        const newRowIndex = sheet.getLastRow();
        
        // 7. Enviar o e-mail de notificação
        sendNotificationEmail(data, newRowIndex, ss.getUrl());

        // 8. Retornar sucesso
        return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: newRowIndex }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log('Erro no doPost: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Envia o e-mail de notificação para o destinatário.
 * @param {Object} data - Os dados do formulário.
 * @param {number} rowIndex - O índice da linha onde os dados foram salvos.
 * @param {string} spreadsheetUrl - O URL da planilha.
 */
function sendNotificationEmail(data, rowIndex, spreadsheetUrl) {
    // Tenta obter o nome da barbearia para o assunto
    const barbeariaNome = data['Nome da barbearia'] || 'Nova Barbearia';
    
    const subject = `Novo Briefing Recebido: ${barbeariaNome}`;
    
    // Cria um link direto para a linha na planilha
    const linkToRow = `${spreadsheetUrl}#gid=0&range=A${rowIndex}`;
    
    const body = `
        Olá,

        Um novo briefing de identidade visual foi respondido para a barbearia "${barbeariaNome}".

        Para visualizar as respostas completas, clique no link abaixo. Você será direcionado diretamente para a linha na planilha onde os dados foram salvos:

        Link para as Respostas: ${linkToRow}

        Atenciosamente,
        Seu Sistema de Briefing.
    `;
    
    MailApp.sendEmail({
        to: EMAIL_DESTINATARIO,
        subject: subject,
        body: body
    });
}
