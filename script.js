document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('briefingForm');
    const statusMessage = document.getElementById('statusMessage');
    const fieldsets = form.querySelectorAll('fieldset');
    let currentStep = 0;

    // Esconde todos os fieldsets, exceto o primeiro
    fieldsets.forEach((fieldset, index) => {
        fieldset.style.display = index === 0 ? 'block' : 'none';
    });

    // --- Lógica de Navegação Multistep ---

    function showStep(stepIndex) {
        fieldsets.forEach((fieldset, index) => {
            fieldset.style.display = index === stepIndex ? 'block' : 'none';
        });
        currentStep = stepIndex;
    }

    function validateCurrentStep() {
        const currentFieldset = fieldsets[currentStep];
        const requiredInputs = currentFieldset.querySelectorAll('[required]');
        let isValid = true;

        // Limpa erros anteriores
        currentFieldset.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        currentFieldset.querySelectorAll('.group-error').forEach(el => el.classList.remove('group-error'));

        requiredInputs.forEach(input => {
            // 1. Validação de campos de texto/número/textarea
            if (input.type !== 'radio' && input.type !== 'checkbox') {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('input-error');
                }
            }
            
            // 2. Validação específica para radio groups
            if (input.type === 'radio') {
                const name = input.name;
                const group = currentFieldset.querySelector(`.radio-group`);
                const isChecked = Array.from(currentFieldset.querySelectorAll(`input[name="${name}"]`)).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    if (group) group.classList.add('group-error');
                } else {
                    if (group) group.classList.remove('group-error');
                }
            }
            
            // 3. Validação específica para checkbox groups (menos comum ser 'required', mas mantida)
            // Nota: Para checkboxes, a validação 'required' em um único checkbox não funciona para grupos.
            // A validação de checkbox groups é mais complexa e geralmente não é usada em formulários multistep.
            // Vamos focar nos campos de texto e radio buttons.
        });

        return isValid;
    }

    form.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-step')) {
            if (validateCurrentStep()) {
                showStatus('', ''); // Limpa mensagem de status
                showStep(currentStep + 1);
            } else {
                showStatus('Por favor, preencha todos os campos obrigatórios para avançar.', 'error');
            }
        } else if (e.target.classList.contains('prev-step')) {
            showStatus('', ''); // Limpa mensagem de status
            showStep(currentStep - 1);
        }
    });

    // --- Lógica para Campos Condicionais (Mantida) ---

    // Q9: Atração - Outros
    const atracaoOutrosCheck = document.getElementById('atracao_outros_check');
    const atracaoOutrosDiv = document.getElementById('atracao_outros_div');
    atracaoOutrosCheck.addEventListener('change', () => {
        atracaoOutrosDiv.style.display = atracaoOutrosCheck.checked ? 'block' : 'none';
        atracaoOutrosDiv.querySelector('textarea').required = atracaoOutrosCheck.checked;
    });

    // Q14: Serviços - Outros
    const servicosOutrosCheck = document.getElementById('servicos_outros_check');
    const servicosOutrosDiv = document.getElementById('servicos_outros_div');
    servicosOutrosCheck.addEventListener('change', () => {
        servicosOutrosDiv.style.display = servicosOutrosCheck.checked ? 'block' : 'none';
        servicosOutrosDiv.querySelector('textarea').required = servicosOutrosCheck.checked;
    });

    // Q17: Estilo Visual - Outros
    const estiloOutrosRadio = document.getElementById('estilo_outros_radio');
    const estiloOutrosDiv = document.getElementById('estilo_outros_div');
    const estiloVisualRadios = document.querySelectorAll('input[name="Estilo Visual Desejado"]');
    
    estiloVisualRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isOutrosSelected = estiloOutrosRadio.checked;
            estiloOutrosDiv.style.display = isOutrosSelected ? 'block' : 'none';
            estiloOutrosDiv.querySelector('textarea').required = isOutrosSelected;
        });
    });

    // --- Lógica de Submissão do Formulário (Mantida) ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // **IMPORTANTE:** Mantenha o URL que você já configurou e que está funcionando.
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
            atracaoOutrosDiv.style.display = 'none';
            servicosOutrosDiv.style.display = 'none';
            estiloOutrosDiv.style.display = 'none';

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
