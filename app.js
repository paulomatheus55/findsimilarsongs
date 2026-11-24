// ===== FUNÇÃO PARA FALAR COM O DEEZER =====

// Um contador para dar um nome diferente a cada pedido
let contador = 0;

function deezer(caminho) {
  return new Promise((resolve, reject) => {
    const nome = "retorno" + contador++;
    const script = document.createElement("script");

    const limpar = () => {
      script.remove();
      delete window[nome];
    };

    window[nome] = (dados) => {
      limpar();
      resolve(dados);
    };

    script.onerror = () => {
      limpar();
      reject(new Error("Falha de rede"));
    };

    const separador = caminho.includes("?") ? "&" : "?";
    script.src = `https://api.deezer.com${caminho}${separador}output=jsonp&callback=${nome}`;
    document.body.appendChild(script);

    setTimeout(() => {
      if (window[nome]) {
        limpar();
        reject(new Error("Tempo esgotado"));
      }
    }, 8000);
  });
}

// Pegar os elementos do HTML
const campo = document.getElementById("busca");
const listaResultados = document.getElementById("resultados");
const mensagem = document.getElementById("status");
const areaEscolhida = document.getElementById("escolhida");

// Cria um elemento HTML
function criar(tag, atributos = {}, texto = "") {
  const elemento = document.createElement(tag);
  Object.assign(elemento, atributos);
  if (texto) elemento.textContent = texto;
  return elemento;
}

// Busca com atraso: espera 400ms após o usuário parar de digitar para fazer a busca
let espera;

campo.addEventListener("input", () => {
  clearTimeout(espera);
  espera = setTimeout(buscar, 400);
});

// Formatação do termo de busca: remove espaços em excesso e o traço entre o nome da música e o artista
async function buscar() {
  const termo = campo.value.replace(/\s[-–—]\s/g, " ").trim();

  listaResultados.replaceChildren();
  if (termo.length < 2) {
    mensagem.textContent = "";
    return;
  }

  try {
    const dados = await deezer(`/search?q=${encodeURIComponent(termo)}&limit=8`);

    if (!dados.data || dados.data.length === 0) {
      mensagem.textContent = "Nenhuma música encontrada. Tente outro nome.";
      return;
    }

    mensagem.textContent = "";

    dados.data.forEach((faixa) => {
      const textos = criar("div", {}, faixa.title);
      textos.append(criar("small", {}, faixa.artist.name));

      const botao = criar("button", { type: "button" });
      botao.append(criar("img", { src: faixa.album.cover_small, alt: "" }), textos);
      botao.addEventListener("click", () => escolher(faixa));

      const item = criar("li");
      item.append(botao);
      listaResultados.append(item);
    });
  } catch (erro) {
    mensagem.textContent = "Não consegui buscar agora. Verifique a internet e tente de novo.";
  }
}

// Música escolhida
function escolher(faixa) {
  listaResultados.replaceChildren();

  const disco = criar("div", { className: "disco" });
  disco.append(criar("img", { src: faixa.album.cover_medium, alt: "" }));

  const textos = criar("div");
  textos.append(criar("h2", {}, faixa.title), criar("p", {}, faixa.artist.name));

  areaEscolhida.replaceChildren(disco, textos);
  areaEscolhida.hidden = false;
}