document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const generateButton = document.getElementById('generate-image');
    const form = document.getElementById('nomesForm');
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    const addFieldButton = document.getElementById('add-field-btn');
    const downloadButtonForm = document.getElementById('downloadJPGForm');
    const fundoGanhadores = localStorage.getItem('fundoGanhadores');

    let downloadCounter = 1; // Contador para botões de download (em caso de upload múltiplo)
    const downloadButtonsContainer = document.getElementById('download-buttons-container');

    // Limitar a adição de campos a no máximo 5
    const maxFields = 4; // Definir o máximo de campos permitidos
    let currentFields = 0; // Contador para os campos adicionados

    // Adicionar novos campos dinamicamente
    addFieldButton.addEventListener('click', () => {
        if(currentFields < maxFields) {   
            const newFieldRow = document.createElement('div');
            newFieldRow.classList.add('form-row');
            newFieldRow.innerHTML = `
                <div class="col-md-4">
                    <div class="form-group">
                        <label>NOME:</label>
                        <input type="text" class="form-control" name="nome[]" placeholder="Digite o nome do ganhador">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label>DEPARTAMENTO:</label>
                        <input type="text" class="form-control" name="departamento[]" placeholder="Digite o departamento do ganhador">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label>PRÊMIO:</label>
                        <input type="text" class="form-control" name="premio[]" placeholder="Digite o prêmio">
                    </div>
                </div>
            `;
            dynamicFieldsContainer.appendChild(newFieldRow);
            currentFields++;

            // Verificar se o limite de campos foi atingido
            if (currentFields === maxFields) {
                addFieldButton.style.display = 'none'; // Oculta o botão após atingir o limite
            }
        }

    });

    // Gerar imagem ao enviar o formulário
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nomes = Array.from(form.querySelectorAll('input[name="nome[]"]')).map(input => input.value.trim());
        const departamentos = Array.from(form.querySelectorAll('input[name="departamento[]"]')).map(input => input.value.trim());
        const premios = Array.from(form.querySelectorAll('input[name="premio[]"]')).map(input => input.value.trim());

        // Validar se todos os campos obrigatórios foram preenchidos
        const data = nomes.map((nome, index) => ({
            nome,
            departamento: departamentos[index],
            premio: premios[index],
        }));

        if (data.length === 0) {
            alert('Por favor, preencha pelo menos um ganhador e o prêmio.');
            return;
        }

        // URL da imagem de fundo (exemplo)
        if (!fundoGanhadores) {
            alert('Nenhuma imagem de fundo foi definida no localStorage.');
            return;
        }

        renderCanvas(data, fundoGanhadores, 'form');
    });

    // Formulário de Upload de Planilha
    fileInput.addEventListener('change', handleFileUpload);

    generateButton.addEventListener('click', function () {
        if (sheetData.length === 0) {
            alert('Nenhum dado encontrado. Por favor, carregue uma planilha primeiro.');
            return;
        }

        // Oculta o botão do formulário de download e limpa os botões de download da planilha anterior
        downloadButtonForm.style.display = 'none';
        downloadButtonsContainer.innerHTML = ''; // Limpa os botões de download anteriores

        let rowData = [];

        for (let i = 0; i < sheetData.length; i++) {
            const nome = sheetData[i][Object.keys(sheetData[i])[0]] || '';  // Pegando o primeiro valor da linha (Nome)
            const departamento = sheetData[i][Object.keys(sheetData[i])[1]] || ''; // Pegando o segundo valor da linha (Departamento)
            const premio = sheetData[i][Object.keys(sheetData[i])[2]] || '';  // Pegando o terceiro valor da linha (Prêmio)

            // Adiciona os dados no array rowData
            rowData.push({ nome, departamento, premio });

            // Quando alcançamos 5 itens ou chegamos ao último, gera uma nova imagem
            if ((i + 1) % 5 === 0 || i === sheetData.length - 1) {
                console.log(rowData);  // Verifique os valores extraídos da planilha

                // Renderiza a imagem para o bloco atual
                renderCanvas(rowData, fundoGanhadores, 'upload');

                // Resetar os dados para o próximo bloco de 5
                rowData = [];
            }
        }
    });

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            alert('Nenhum arquivo selecionado.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Converte a planilha em um JSON, considerando a primeira linha como título
            sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });  // Considera os dados como array de arrays

            // Remove a primeira linha (títulos)
            sheetData.shift();  // Remove a primeira linha

            console.log(sheetData); // Verifique a estrutura dos dados da planilha
            alert('Planilha carregada com sucesso!');
        };

        reader.readAsArrayBuffer(file);
    }

    // Função para renderizar o canvas
    function renderCanvas(data, customConst, formType) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Configurações do canvas
        canvas.width = 800;
        canvas.height = 600;

        img.src = customConst; // Base64 da imagem
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ajusta o tamanho do canvas para a imagem
            canvas.width = img.width;
            canvas.height = img.height;

            // Desenha a imagem de fundo
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Função para desenhar retângulo com bordas arredondadas
            function drawRoundedRect(x, y, width, height, radius) {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.arcTo(x + width, y, x + width, y + height, radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
                ctx.lineTo(x + radius, y + height);
                ctx.arcTo(x, y + height, x, y + height - radius, radius);
                ctx.lineTo(x, y + radius);
                ctx.arcTo(x, y, x + radius, y, radius);
                ctx.closePath();
                ctx.fillStyle = 'white';
                ctx.fill();
            }

            // Função para quebrar o texto em várias linhas
            function wrapText(text, x, y, maxWidth, lineHeight) {
                var words = text.split(' ');
                var line = '';
                var lines = [];

                for (var i = 0; i < words.length; i++) {
                    var testLine = line + words[i] + ' ';
                    var testWidth = ctx.measureText(testLine).width;

                    if (testWidth > maxWidth && i > 0) {
                        lines.push(line);
                        line = words[i] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line); // adicionar a última linha

                // Desenhar todas as linhas
                for (var j = 0; j < lines.length; j++) {
                    ctx.fillText(lines[j], x, y + j * lineHeight);
                }
            }

            // Função para desenhar os retângulos e textos (nome e prêmio lado a lado)
            function drawTextWithBackground(xNome, yNome, xDepartamento, yDepartamento, xPremio, yPremio, nome, departamento, premio) {

                nome = nome ? nome.toUpperCase() : '';
                departamento = departamento ? departamento.toUpperCase() : '';
                premio = premio ? premio.toUpperCase() : '';

                if (nome && departamento && premio) {

                    if (nome.length > 23) {
                        drawRoundedRect(xNome, yNome, 550, 80, 20);
                        ctx.font = 'bold 28px "Noto Sans", sans-serif';
                        ctx.fillStyle = '#14179a';
                        wrapText(nome, xNome + 15, yNome + 34, 520, 30);
                    } else {
                        drawRoundedRect(xNome, yNome, 550, 80, 20);
                        ctx.font = 'bold 32px "Noto Sans", sans-serif';
                        ctx.fillStyle = '#14179a';
                        ctx.fillText(nome, xNome + 15, yNome + 50);
                    }

                    if (premio.length > 23) {
                        drawRoundedRect(xPremio, yPremio, 410, 80, 20);
                        ctx.font = 'bold 20px "Noto Sans", sans-serif';
                        ctx.fillStyle = '#14179a';
                        wrapText(premio, xPremio + 15, yPremio + 33, 380, 25);
                    } else {
                        drawRoundedRect(xPremio, yPremio, 410, 80, 20);
                        ctx.font = 'bold 25px "Noto Sans", sans-serif';
                        ctx.fillStyle = '#14179a';
                        ctx.fillText(premio, xPremio + 15, yPremio + 50);
                    }

                    ctx.font = 'bold 22px "Noto Sans", sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(departamento, xDepartamento + 15, yDepartamento + 105);
                }
            }

            // Controle de páginas (max 5 itens por página)
            let currentPageY = 400; // Posição inicial Y para o primeiro item
            let itemsPerPage = 5;   // Definir o número de itens por página
            let currentItem = 0;     // Contador de itens por página
            let pageNumber = 1;      // Número da página
    
            // Limpeza do canvas e reinício quando necessário
            function resetCanvasPage() {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa a página atual
                ctx.drawImage(img, 0, 0, img.width, img.height);  // Redesenha a imagem de fundo
            }

            // Adicionar os nomes e prêmios ao canvas
            data.forEach((item, index) => {
                // Se for o 6º item, reiniciar a página
                if (currentItem === itemsPerPage) {
                    currentPageY = 400; // Reinicia a posição Y
                    currentItem = 0; // Reseta o contador de itens
                    resetCanvasPage(); // Redefine o canvas
                    pageNumber++; // Aumenta o número da página
                }

                const yPosition = currentPageY + (currentItem * 130);  // Ajuste do espaçamento para cada item

                // Desenha o texto e retângulos com nome, departamento e prêmio
                drawTextWithBackground(
                    50, yPosition, // Nome
                    50, yPosition, // Departamento
                    620, yPosition, // Prêmio
                    item.nome, item.departamento, item.premio
                );

                currentItem++;  // Incrementa o contador de itens
            });

            // Gera o link de download
            const imageDataURL = canvas.toDataURL('image/jpeg');

            if (formType === 'upload') {
                const downloadButton = document.createElement('a');
                downloadButton.href = imageDataURL;
                downloadButton.download = `ganhadores_${Date.now()}.jpg`;  // Nome da imagem

                // Adiciona um ícone de download (pode ser um ícone com FontAwesome ou SVG)
                const icon = document.createElement('i');
                icon.classList.add('fa', 'fa-download');  // FontAwesome download icon

                // Adiciona o número para indicar o número da imagem (ex: 01, 02, etc.)
                const numberLabel = document.createElement('span');
                numberLabel.textContent = String(downloadCounter).padStart(2, '0');  // Ex: "01", "02"
                numberLabel.style.marginLeft = '5px'; // Margem entre ícone e número
                numberLabel.style.fontSize = '18px';  // Tamanho do número

                // Ajustando o tamanho do botão
                downloadButton.style.display = 'inline-flex';
                downloadButton.style.alignItems = 'center';
                downloadButton.style.padding = '8px 12px';  // Botão mais compacto
                downloadButton.style.fontSize = '14px';  // Tamanho pequeno para o texto
                downloadButton.classList.add('btn', 'btn-secondary'); // Classe para botão estilizado

                // Adicionando o ícone e o número
                downloadButton.appendChild(icon);
                downloadButton.appendChild(numberLabel);

                // Adiciona o botão ao container de botões
                downloadButtonsContainer.appendChild(downloadButton);

                // Incrementa o contador para o próximo botão
                downloadCounter++;
            } else {
                if (downloadButtonForm) { // Verifica se o botão de download do formulário está disponível
                    downloadButtonForm.download = `ganhadores_${Date.now()}.jpg`;
                    downloadButtonForm.href = imageDataURL;
                    downloadButtonForm.style.display = 'block'; // Torna o botão visível
                }
            }
        };
    }
});
