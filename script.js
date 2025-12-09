document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('briefingForm');
    const statusMessage = document.getElementById('statusMessage');

    // --- Lógica para Campos Condicionais ---

    // Função genérica para campos condicionais
    function setupConditionalField(triggerId, targetId) {
        const trigger = document.getElementById(triggerId);
        const targetDiv = document.getElementById(targetId);
        
        if (trigger && targetDiv) {
            const updateVisibility = () => {
                const isChecked = trigger.checked;
                targetDiv.style.display = isChecked ? 'block' : 'none';
                targetDiv.querySelector('textarea').required = isChecked;
            };

            // Para checkboxes e radio buttons
            if (trigger.type === 'checkbox' || trigger.type === 'radio') {
                trigger.addEventListener('change', updateVisibility);
                // Se for radio, precisa monitorar todos os radios do mesmo grupo
                if (trigger.type === 'radio') {
                    document.querySelectorAll(`input[name="${trigger.name}"]`).forEach(radio => {
                        radio.addEventListener('change', updateVisibility);
                    });
                }
            }
            // Inicializa o estado
            updateVisibility();
        }
    }

    setupConditionalField('atracao_outros_check', 'atracao_outros_div');
    setupConditionalField('servicos_outros_check', 'servicos_outros_div');
    setupConditionalField('estilo_outros_radio', 'estilo_outros_div');

    // --- Lógica de Submissão do Formulário ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // **SCRIPT_URL CORRIGIDO:** Este é o URL que você me forneceu anteriormente.
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSpyZv64jL2uP9UTAJ6D5fEcb4W4_aFYUX3e0UQ3of-8fD0Qa3JeFxGId0gyOW-L2qgA/exec'; 

        if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            showStatus('Erro: O URL do Google Apps Script não foi configurado.', 'error');
            return;
        }

        // Validação nativa do HTML5
        if (!form.checkValidity()) {
            form.reportValidity();
            showStatus('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Cria um novo FormData para incluir os arquivos
        const formData = new FormData(form);
        
        // Adiciona um timestamp para registro na planilha
        formData.append('Timestamp', new Date().toLocaleString('pt-BR'));

        showStatus('Enviando briefing e arquivos...', 'info');
        
        try {
            // Envio usando fetch com FormData (necessário para arquivos)
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                // Não é necessário definir Content-Type para FormData
                body: formData
            });

            // O Google Apps Script retorna um JSON com a resposta
            const result = await response.json();

            if (result.result === 'success') {
                showStatus('Briefing enviado com sucesso! Agradecemos o seu preenchimento.', 'success');
                form.reset(); // Limpa o formulário após o envio
                
                // Oculta campos condicionais após o reset
                document.getElementById('atracao_outros_div').style.display = 'none';
                document.getElementById('servicos_outros_div').style.display = 'none';
                document.getElementById('estilo_outros_div').style.display = 'none';
            } else {
                showStatus('Erro ao enviar o briefing. Por favor, tente novamente. Detalhes: ' + result.message, 'error');
            }

        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            showStatus('Erro de conexão ao enviar o briefing. Por favor, tente novamente.', 'error');
        }
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = ''; // Limpa classes anteriores
        statusMessage.classList.add(type);
        statusMessage.style.display = message ? 'block' : 'none'; // Esconde se a mensagem estiver vazia
    }
});
