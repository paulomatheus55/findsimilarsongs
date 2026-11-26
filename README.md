# Ache músicas parecidas

Site para descobrir músicas parecidas: busque uma música, escolha uma na lista e ouça prévias de 30 segundos de sugestões, sem sair da página.

**Site:** https://github.com/paulomatheus55/musicas-parecidas.git

## Como funciona

1. A busca consulta a API pública do Deezer.
2. Ao escolher uma música, o site pega artistas parecidos com o artista dela e as 2 músicas mais populares de cada um.
3. Cada sugestão vira um card com prévia de áudio.

As sugestões são baseadas na similaridade entre **artistas** segundo o Deezer, e não entre as músicas em si.

## Tecnologias

HTML, CSS e JavaScript puros, sem frameworks e sem servidor. Dados e prévias vêm da [API do Deezer](https://developers.deezer.com/api), que é gratuita e não exige cadastro.

## Limitações

- Só toca prévias de 30 segundos, não as músicas completas.
- Artistas pouco conhecidos podem voltar sem sugestões.

## Aviso

Projeto de estudo, sem vínculo com o Deezer. Todos os direitos reservados.