/*
@author hyp
*/

var ultimoValor = 0;
var valorZ = 0;
var urlForum = 'http://www.hardmob.com.br/promocoes/';

// Envia uma requisição AJAX GET, obtendo o HTML do fórum.
function obtemDadosForum()
{
	$.ajax({  
		type: 'GET',
        url: urlForum,  
        success: function(data) 
		{
				/* A requisição ocorreu com sucesso, trabalha com o retorno HTML (data) */
				
				// 1. Obtém uma referência ao primeiro span de classe 'first_last' (existem 2, mas só precisa de 1)
				var spanRef = $('.first_last:first', $(data));
				if (spanRef.length) // achou
				{
					// Dentro desse span existe uma tag <a> contendo um atributo denominado 'title'.
					// Este atributo contém o nr. de tópicos, no formato: 'Última Página - Resultados X à Y de Z'
					// Iremos atrás do valor 'Z'.
					
					// 2. Obtém referência ao elemento <a>
					var aRef = spanRef.children('a');
					if (aRef.length) // achou
					{
						// 3. Obtém o atributo 'title' do elemento <a>
						var titulo = aRef.attr('title'); 
						if (titulo != undefined && titulo.length) // achou
						{
						  // 4. Já temos o título, agora precisa fazer um parse para obter o último número (Z).
						  valorZ = retornaZ(titulo);
						  
						  // 5. Utiliza o valor para verificar se existe um tópico novo.
						  if (valorZ == ultimoValor)
						  {
						   chrome.browserAction.setIcon({path:"default.png"}); // seta o ícone da bola vermelha
						  }
						  else if (valorZ > ultimoValor)
						  {
						    // Achou tópico novo. Muda o ícone pra verde e o mantém nesta cor até o usuário
							// clicar no ícone. Após clicar, o ícone fica vermelho e a contagem continua.
							// A função de clique está mais pra baixo, no $(document).ready.
							chrome.browserAction.setIcon({path:"new.png"}); // seta o ícone da bola verde
							chrome.browserAction.setTitle({"title": valorZ.toString()}); // seta o valor no título do ícone
						  }

						}
					}
				}	
		}
    });
}

function retornaZ(titulo)
{
	// Obtém a posição do último espaço existente no título, antes do Z.
	//  Última Página - Resultados X à Y de<queremos_esse_espaço>Z
	var posUltimoEspaco = titulo.lastIndexOf(' ');
	
	// Esse cálculo obtém exatamente o Z
	var valorZ = titulo.substring(posUltimoEspaco, titulo.length);
	
	return parseFloat(valorZ);
}

$(document).ready(function() {

	// Adiciona um evento de clique no botão
	// Através do evento, o fórum de promoções abre em uma nova aba
	// e a contagem continua.
	chrome.browserAction.onClicked.addListener(function(tab) 
		{
			ultimoValor = valorZ;
			chrome.browserAction.setIcon({path:"default.png"}); // seta o ícone da bola vermelha
			chrome.tabs.create({'url': urlForum});
		});
		
	// Verifica a cada 30 segundos
	setInterval(function() {
	obtemDadosForum();
	}, 30000);
});