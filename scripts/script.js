document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input');
    const generateButton = document.getElementById('generate-image');
    const downloadButtonForm = document.getElementById('downloadJPGForm');
    const downloadButtonsContainer = document.getElementById('download-buttons-container');
    const form = document.getElementById('nomesForm');
    const fundoGanhadores = localStorage.getItem('fundoGanhadores');
    
    let sheetData = []; // Armazenará os dados lidos da planilha
    let downloadCounter = 1; // Contador para a numeração dos botões

    // Formulário Padrão
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Oculta qualquer botão de download anterior
        downloadButtonsContainer.innerHTML = '';

        const formData = {
            nome1: document.getElementById('nome').value,
            premio1: document.getElementById('premio').value,
            nome2: document.getElementById('nome2').value,
            premio2: document.getElementById('premio2').value,
            nome3: document.getElementById('nome3').value,
            premio3: document.getElementById('premio3').value,
            nome4: document.getElementById('nome4').value,
            premio4: document.getElementById('premio4').value,
            nome5: document.getElementById('nome5').value,
            premio5: document.getElementById('premio5').value,
        };

        renderCanvas(formData, fundoGanhadores, 'form');
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

        // Dividir os dados em grupos de 5
        let rowData = {
            nome1: '', premio1: '', nome2: '', premio2: '', nome3: '', premio3: '',
            nome4: '', premio4: '', nome5: '', premio5: ''
        };

        for (let i = 0; i < sheetData.length; i++) { // Aqui vamos processar todas as linhas
            const nome = sheetData[i][Object.keys(sheetData[i])[0]] || '';  // Pegando o primeiro valor da linha (Nome)
            const premio = sheetData[i][Object.keys(sheetData[i])[1]] || '';  // Pegando o segundo valor da linha (Prêmio)

            const index = i % 5;  // Distribui os dados de 5 em 5
            rowData[`nome${index + 1}`] = nome;
            rowData[`premio${index + 1}`] = premio;

            // Quando alcançamos 5 itens ou chegamos ao último, gera uma nova imagem
            if ((i + 1) % 5 === 0 || i === sheetData.length - 1) {
                console.log(rowData);  // Verifique os valores extraídos da planilha

                // Renderiza a imagem para o bloco atual
                renderCanvas(rowData, fundoGanhadores, 'upload');

                // Resetar os dados para o próximo bloco de 5
                rowData = {
                    nome1: '', premio1: '', nome2: '', premio2: '', nome3: '', premio3: '',
                    nome4: '', premio4: '', nome5: '', premio5: ''
                };
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

    // Função genérica para renderizar o canvas
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
				ctx.fillStyle = 'white';  // Cor de fundo do botão
				ctx.fill();
			}
	
			// Função para desenhar os retângulos e textos (nome e prêmio lado a lado)
			function drawTextWithBackground(xNome, yNome, xPremio, yPremio, nome, premio) {
				// Desenha o retângulo para o nome (mais largo e mais alto)
				if (nome && premio) {
					drawRoundedRect(xNome, yNome, 550, 80, 20);  // Retângulo do nome (largura aumentada, altura aumentada)
					ctx.font = 'bold 32px "Noto Sans", sans-serif';
					ctx.fillStyle = '#14179a'; // Cor da fonte do nome
					ctx.fillText(nome, xNome + 15, yNome + 50);  // Ajuste a posição do nome
				}
	
				// Desenha o retângulo para o prêmio (ao lado do nome, mais alto também)
				if (nome && premio) {
					drawRoundedRect(xPremio, yPremio, 410, 80, 20);  // Retângulo do prêmio
					ctx.font = 'bold 25px "Noto Sans", sans-serif';
					ctx.fillStyle = '#14179a'; // Cor da fonte do prêmio
					ctx.fillText(premio, xPremio + 15, yPremio + 50);  // Ajuste a posição do prêmio
				}
			}
	
			// Adiciona os textos e os retângulos, somente se os valores existirem
			if (data.nome1 && data.premio1) {
				drawTextWithBackground(50, 400, 620, 400, data.nome1, data.premio1);
			}
	
			if (data.nome2 && data.premio2) {
				drawTextWithBackground(50, 530, 620, 530, data.nome2, data.premio2);
			}
	
			if (data.nome3 && data.premio3) {
				drawTextWithBackground(50, 660, 620, 660, data.nome3, data.premio3);
			}
	
			if (data.nome4 && data.premio4) {
				drawTextWithBackground(50, 790, 620, 790, data.nome4, data.premio4);
			}
	
			if (data.nome5 && data.premio5) {
				drawTextWithBackground(50, 920, 620, 920, data.nome5, data.premio5);
			}

            // Gera o link de download
            const imageDataURL = canvas.toDataURL('image/jpeg');

            // Cria um novo botão de download, caso seja para a planilha
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
            }
            // Para o formulário padrão, já existe um botão de download visível
            else {
                if (downloadButtonForm) { // Verifica se o botão de download do formulário está disponível
                    downloadButtonForm.download = `ganhadores_${Date.now()}.jpg`;
                    downloadButtonForm.href = imageDataURL;
                    downloadButtonForm.style.display = 'block'; // Torna o botão visível
                }
            }
        };
    }
});
