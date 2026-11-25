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

const campo = document.getElementById("busca");
const listaResultados = document.getElementById("resultados");
const mensagem = document.getElementById("status");
const areaEscolhida = document.getElementById("escolhida");
const areaSugestoes = document.getElementById("sugestoes");

// Cria um elemento HTML
function criar(tag, atributos = {}, texto = "") {
  const elemento = document.createElement(tag);
  Object.assign(elemento, atributos);
  if (texto) elemento.textContent = texto;
  return elemento;
}

// Busca
let espera;

campo.addEventListener("input", () => {
  clearTimeout(espera);
  espera = setTimeout(buscar, 400);
});

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

// Música escolhida e busca de sugestões
async function escolher(faixa) {
  listaResultados.replaceChildren();
  areaSugestoes.replaceChildren();

  const disco = criar("div", { className: "disco" });
  disco.append(criar("img", { src: faixa.album.cover_medium, alt: "" }));

  const textos = criar("div");
  textos.append(criar("h2", {}, faixa.title), criar("p", {}, faixa.artist.name));

  areaEscolhida.replaceChildren(disco, textos);
  areaEscolhida.hidden = false;
  mensagem.textContent = "Procurando músicas parecidas...";

  try {
    // Artistas parecidos com o artista da música escolhida
    const parecidos = await deezer(`/artist/${faixa.artist.id}/related?limit=6`);

    if (!parecidos.data || parecidos.data.length === 0) {
      mensagem.textContent = "Não encontrei artistas parecidos para essa música.";
      return;
    }

    // As 2 músicas mais populares de cada artista parecido
    const respostas = await Promise.all(
      parecidos.data.map((artista) =>
        deezer(`/artist/${artista.id}/top?limit=2`)
          .then((r) => r.data || [])
          .catch(() => [])
      )
    );

    // Junta tudo, tira repetidas, a própria música e as sem prévia
    const vistas = new Set([faixa.id]);
    const sugestoes = respostas.flat().filter((f) => {
      if (!f.preview || vistas.has(f.id)) return false;
      vistas.add(f.id);
      return true;
    });

    if (sugestoes.length === 0) {
      mensagem.textContent = "Achei artistas parecidos, mas sem músicas disponíveis.";
      return;
    }

    mensagem.textContent = "Músicas parecidas:";
    sugestoes.forEach(criarCard);
  } catch (erro) {
    mensagem.textContent = "Algo deu errado ao buscar as sugestões. Tente de novo em instantes.";
  }
}

// PROVISÓRIO: no Módulo 7 vamos trocar isto pelo card de verdade
function criarCard(faixa) {
  areaSugestoes.append(criar("p", {}, faixa.title + " - " + faixa.artist.name));
}