document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('briefingForm');
    const statusMessage = document.getElementById('statusMessage');
    const fieldsets = form.querySelectorAll('fieldset');
    let currentStep = 0;

    // 1. Inicialização: Esconde todos os fieldsets, exceto o primeiro
    fieldsets.forEach((fieldset, index) => {
        fieldset.style.display = index === 0 ? 'block' : 'none';
    });

    // 2. Função de Transição de Tela
    function showStep(stepIndex) {
        // Garante que o índice está dentro dos limites
        if (stepIndex < 0 || stepIndex >= fieldsets.length) return;

        // Esconde o fieldset atual
        fieldsets[currentStep].style.display = 'none';
        
        // Mostra o novo fieldset
        fieldsets[stepIndex].style.display = 'block';
        
        // Atualiza o passo atual
        currentStep = stepIndex;
        
        // Limpa a mensagem de status
        showStatus('', '');
    }

    // 3. Lógica de Navegação
    form.addEventListener('click', (e) => {
        // Verifica se o clique foi em um botão de navegação
        if (e.target.classList.contains('next-step') || e.target.classList.contains('prev-step')) {
            e.preventDefault(); // Previne o envio do formulário

            if (e.target.classList.contains('next-step')) {
                const currentFieldset = fieldsets[currentStep];
                
                // **VALIDAÇÃO SIMPLIFICADA:** Usa a validação nativa do HTML5
                if (!currentFieldset.checkValidity()) {
                    currentFieldset.reportValidity();
                    showStatus('Por favor, preencha todos os campos obrigatórios para avançar.', 'error');
                    return;
                }
                showStep(currentStep + 1);
            } else if (e.target.classList.contains('prev-step')) {
                showStep(currentStep - 1);
            }
        }
    });

    // --- Lógica para Campos Condicionais (Mantida) ---

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


    // --- Lógica de Submissão do Formulário (Mantida) ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // **SCRIPT_URL CORRIGIDO:** Este é o URL que você me forneceu anteriormente.
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSpyZv64jL2uP9UTAJ6D5fEcb4W4_aFYUX3e0UQ3of-8fD0Qa3JeFxGId0gyOW-L2qgA/exec'; 

        if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            showStatus('Erro: O URL do Google Apps Script não foi configurado.', 'error');
            return;
        }

        const formData = new FormData(form);
        const data = {};

        // Processa os dados do formulário, tratando campos de múltipla escolha
        const multiValueFields = {};

        for (const [key, value] of formData.entries()) {
            // Verifica se o campo é de múltipla escolha (checkboxes)
            if (key === "O que mais atrai clientes hoje?" || key === "Serviços Oferecidos" || key === "Tom de Comunicação") {
                if (!multiValueFields[key]) {
                    multiValueFields[key] = [];
                }
                multiValueFields[key].push(value);
            } else {
                // Para campos de texto, número e radio button, o valor é único
                data[key] = value;
            }
        }

        // Junta os valores de múltipla escolha em uma única string
        for (const key in multiValueFields) {
            data[key] = multiValueFields[key].join(', ');
        }

        // Adiciona um timestamp para registro na planilha
        data['Timestamp'] = new Date().toLocaleString('pt-BR');

        showStatus('Enviando briefing...', 'info');
        
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Necessário para Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // Como usamos 'no-cors', a resposta será opaca. 
            // O sucesso é inferido se não houver erro de rede.
            showStatus('Briefing enviado com sucesso! Agradecemos o seu preenchimento.', 'success');
            form.reset(); // Limpa o formulário após o envio
            showStep(0); // Volta para o primeiro passo
            
            // Oculta campos condicionais após o reset
            document.getElementById('atracao_outros_div').style.display = 'none';
            document.getElementById('servicos_outros_div').style.display = 'none';
            document.getElementById('estilo_outros_div').style.display = 'none';

        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            showStatus('Erro ao enviar o briefing. Por favor, tente novamente.', 'error');
        }
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = ''; // Limpa classes anteriores
        statusMessage.classList.add(type);
        statusMessage.style.display = message ? 'block' : 'none'; // Esconde se a mensagem estiver vazia
    }
});
