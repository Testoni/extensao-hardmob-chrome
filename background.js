/*
@author hyp
*/

var ultimoValor = 0;
var valorZ = 0;
var urlForum = 'http://www.hardmob.com.br/promocoes/';

// Envia uma requisi��o AJAX GET, obtendo o HTML do f�rum.
function obtemDadosForum()
{
	$.ajax({  
		type: 'GET',
        url: urlForum,  
        success: function(data) 
		{
				/* A requisi��o ocorreu com sucesso, trabalha com o retorno HTML (data) */
				
				// 1. Obt�m uma refer�ncia ao primeiro span de classe 'first_last' (existem 2, mas s� precisa de 1)
				var spanRef = $('.first_last:first', $(data));
				if (spanRef.length) // achou
				{
					// Dentro desse span existe uma tag <a> contendo um atributo denominado 'title'.
					// Este atributo cont�m o nr. de t�picos, no formato: '�ltima P�gina - Resultados X � Y de Z'
					// Iremos atr�s do valor 'Z'.
					
					// 2. Obt�m refer�ncia ao elemento <a>
					var aRef = spanRef.children('a');
					if (aRef.length) // achou
					{
						// 3. Obt�m o atributo 'title' do elemento <a>
						var titulo = aRef.attr('title'); 
						if (titulo != undefined && titulo.length) // achou
						{
						  // 4. J� temos o t�tulo, agora precisa fazer um parse para obter o �ltimo n�mero (Z).
						  valorZ = retornaZ(titulo);
						  
						  // 5. Utiliza o valor para verificar se existe um t�pico novo.
						  if (valorZ == ultimoValor)
						  {
						   chrome.browserAction.setIcon({path:"default.png"}); // seta o �cone da bola vermelha
						  }
						  else if (valorZ > ultimoValor)
						  {
						    // Achou t�pico novo. Muda o �cone pra verde e o mant�m nesta cor at� o usu�rio
							// clicar no �cone. Ap�s clicar, o �cone fica vermelho e a contagem continua.
							// A fun��o de clique est� mais pra baixo, no $(document).ready.
							chrome.browserAction.setIcon({path:"new.png"}); // seta o �cone da bola verde
							chrome.browserAction.setTitle({"title": valorZ.toString()}); // seta o valor no t�tulo do �cone
						  }

						}
					}
				}	
		}
    });
}

function retornaZ(titulo)
{
	// Obt�m a posi��o do �ltimo espa�o existente no t�tulo, antes do Z.
	//  �ltima P�gina - Resultados X � Y de<queremos_esse_espa�o>Z
	var posUltimoEspaco = titulo.lastIndexOf(' ');
	
	// Esse c�lculo obt�m exatamente o Z
	var valorZ = titulo.substring(posUltimoEspaco, titulo.length);
	
	return parseFloat(valorZ);
}

$(document).ready(function() {

	// Adiciona um evento de clique no bot�o
	// Atrav�s do evento, o f�rum de promo��es abre em uma nova aba
	// e a contagem continua.
	chrome.browserAction.onClicked.addListener(function(tab) 
		{
			ultimoValor = valorZ;
			chrome.browserAction.setIcon({path:"default.png"}); // seta o �cone da bola vermelha
			chrome.tabs.create({'url': urlForum});
		});
		
	// Verifica a cada 30 segundos
	setInterval(function() {
	obtemDadosForum();
	}, 30000);
});