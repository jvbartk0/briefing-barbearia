// **NOVO CÓDIGO DO GOOGLE APPS SCRIPT PARA SUPORTE A UPLOAD DE ARQUIVOS**

// 1. CONFIGURAÇÕES
const SPREADSHEET_ID = '1g5RNsnPkS4SjuExmoFNW_fHJGGn6eAf-4sC7MaylLHQ'; // SEU ID DA PLANILHA
const EMAIL_DESTINATARIO = 'jvbartk0@gmail.com'; // SEU E-MAIL
const NOME_BARBEARIA = 'Barbearia Briefing'; // Nome para o assunto do e-mail
const FOLDER_ID = '1gQ8Y2aARBjFM-6UUmDiezdwQvqmSy6Hc'; // **IMPORTANTE:** ID da pasta no Google Drive onde os arquivos serão salvos. Crie uma pasta e coloque o ID aqui.

// 2. FUNÇÃO PRINCIPAL (doPost)
function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(30000); // Espera por no máximo 30 segundos

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = {};
    const fileLinks = [];

    // Processa os dados do formulário
    const formFields = e.postData.type === 'application/json' ? JSON.parse(e.postData.contents) : e.parameters;

    // Processa arquivos (se houver)
    if (e.postData.type === 'multipart/form-data') {
      for (const key in e.parameters) {
        const param = e.parameters[key];
        
        // Verifica se é um arquivo
        if (param.length && param[0].getName) {
          const file = param[0];
          const blob = file.copyBlob();
          
          // Salva o arquivo no Google Drive
          const folder = DriveApp.getFolderById(FOLDER_ID);
          const savedFile = folder.createFile(blob);
          
          // Define o link do arquivo para ser salvo na planilha
          fileLinks.push(`[${file.getName()}](${savedFile.getUrl()})`);
          
          // Adiciona o link do arquivo à linha de dados
          rowData[key] = fileLinks.join(' | ');
        } else {
          // Se não for arquivo, trata como campo normal
          rowData[key] = param.join(', '); // Trata campos com múltiplos valores (checkboxes)
        }
      }
    } else {
      // Se não houver arquivo, trata como JSON (envio anterior)
      for (const key in formFields) {
        rowData[key] = formFields[key];
      }
    }

    // Garante que o Timestamp seja adicionado
    if (!rowData['Timestamp']) {
      rowData['Timestamp'] = new Date().toLocaleString('pt-BR');
    }

    // Mapeia os dados para a ordem dos cabeçalhos da planilha
    const newRow = headers.map(header => rowData[header] || '');

    // Adiciona a nova linha à planilha
    sheet.appendRow(newRow);
    const lastRow = sheet.getLastRow();

    // Envia o e-mail de notificação
    sendNotificationEmail(rowData, lastRow);

    lock.releaseLock();
    
    // Retorna sucesso para o frontend
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', message: 'Dados e arquivos salvos com sucesso.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
    Logger.log(error);
    
    // Retorna erro para o frontend
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. FUNÇÃO DE ENVIO DE E-MAIL
function sendNotificationEmail(data, rowNumber) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const sheetUrl = sheet.getOwner().getUrl();
  const linkToRow = `${sheetUrl}#gid=${sheet.getSheetId()}&range=A${rowNumber}`;
  
  let emailBody = `Um novo briefing foi enviado para a ${NOME_BARBEARIA}!\n\n`;
  emailBody += `--------------------------------------------------\n`;
  
  // Adiciona os dados do formulário ao corpo do e-mail
  for (const key in data) {
    emailBody += `${key}: ${data[key]}\n`;
  }
  
  emailBody += `--------------------------------------------------\n`;
  emailBody += `\nPara visualizar as respostas diretamente na planilha, clique no link abaixo:\n`;
  emailBody += `${linkToRow}\n\n`;
  emailBody += `Os arquivos anexados (se houver) foram salvos no Google Drive.`;

  MailApp.sendEmail({
    to: EMAIL_DESTINATARIO,
    subject: `[NOVO BRIEFING] ${NOME_BARBEARIA} - ${data['Nome da barbearia'] || 'Sem Nome'}`,
    body: emailBody
  });
}

// 4. FUNÇÃO DE TESTE (Opcional)
function testDoPost() {
  // Esta função é apenas para testar a lógica no editor do Apps Script
  // Ela simula um evento 'e' com dados
  const mockEvent = {
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        'Nome da barbearia': 'Barbearia Teste',
        'Ano de fundação': '2020',
        'Timestamp': new Date().toLocaleString('pt-BR')
      })
    },
    parameters: {
      'Nome da barbearia': ['Barbearia Teste'],
      'Ano de fundação': ['2020'],
      'Timestamp': [new Date().toLocaleString('pt-BR')]
    }
  };
  // doPost(mockEvent);
  Logger.log('Teste de doPost concluído. Verifique a planilha.');
}
