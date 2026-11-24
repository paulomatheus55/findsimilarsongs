// ===== FUNÇÃO PARA FALAR COM O DEEZER =====

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
