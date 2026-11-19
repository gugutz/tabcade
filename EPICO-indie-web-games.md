# Épico: catálogo de jogos indie de navegador

> Para continuar: "continua o trabalho do épico dos jogos indie" e aponte para este arquivo.

## Próxima ação

1. **Dona:** quando o pi5 voltar, avisar para comparar o `indie.json` de lá com o do GitHub (`gugutz/tau-control`, commit `4fa1db5`, 31/10). Se houver jogos novos, viram manifestos.
2. **Dona:** escolher o nome e registrar o domínio. Depois: renomear a pasta, trocar `SITE_NAME` em `src/games.ts`, `site` em `astro.config.mjs`, `public/robots.txt` e `name` em `package.json`/`wrangler.jsonc`.
3. Ligar o Workers Builds ao repositório (como no botanolapis; feito pela dona no painel do Cloudflare). Primeiro push feito em 2026-11-19 (commit `4fa3cff`).
4. **Dona:** achar os autores de `games/author1` (Cruising Bones) e `games/author2` (Grav Wars) e os posts do Reddit de todos. O Reddit é bloqueado no navegador do app e a API pede aprovação, então essa busca é manual.
5. Preencher `ads` e `purchases` (todos `unknown`). Capas: só com permissão.
6. Discovery: script de fila (itch.io RSS + Show HN automáticos; Reddit por link colado à mão).

## Estado atual

- 2026-11-19 (3ª entrega): **autores e repositório.**
  - Nenhum jogo é da dona. Pastas: `ag86` (Afterglow 86: autor achado no post do fórum do three.js de 01/10/2026, que virou o `source_url`; o autor diz que usou o Claude, então `ai: [code]`), `wonky` (o site se chama "Wonky's Arcade"; Hellswarm e Isometric Doom), `author1` (Cruising Bones) e `author2` (Grav Wars) com nome "Unknown (site)" e TODO. Moongate, Muliache Games, Slop Studios, amoreo140 e jonesiller mantidos como no tau-control.
  - Busca: web, Hacker News (API do Algolia, nada para nenhum dos 11) e os próprios sites. Reddit não pesquisado: o navegador do app bloqueia reddit.com.
  - Repositório público `gugutz/tabcade` criado (vazio); `git init` local com `origin` apontando para ele. Primeiro commit `4fa3cff` enviado em 2026-11-19 (o `gh` precisou da permissão `workflow`). README curto; about e página do jogo apontam para o repositório (o "Edit this game's manifest" abre o editor do GitHub no YAML).

- 2026-11-19 (2ª entrega): **catálogo por manifestos YAML.**
  - `games/<desenvolvedor>/developer.yaml` + `games/<desenvolvedor>/<jogo>.yaml`. Esquema em `src/content.config.ts` (coleções de conteúdo do Astro, validação com zod, sem dependência nova). Documentação para a comunidade em `CONTRIBUTING.md` (inglês); manter os dois iguais.
  - Campos: `title`, `play_url` (https), `page_url`, `source_url`, `source_code`, `description` (10–300), `genre` (lista fechada de 18), `tags`, `mobile`, `multiplayer` (none/local/online), `ai` (true/false/lista code, art, audio, text; ausente = não informado), `ads` e `purchases` (obrigatórios: true/false/unknown), `needs`, `stage`, `cover` (imagem ao lado do YAML, otimizada pelo Astro), `added`. Campo desconhecido é erro (pega erro de digitação).
  - O build falha se: campo errado ou faltando, `http://`, gênero fora da lista, pasta sem `developer.yaml`, ou dois jogos com o mesmo `play_url`. Os três casos testados em 2026-11-19. `.github/workflows/validate.yml` roda o build em todo PR (não testado: o repositório não existe).
  - 11 jogos importados do GitHub (`gugutz/tau-control`, `server/catalog_seed/indie.json`, commit `4fa1db5`) em 9 pastas. Descrições traduzidas para inglês. Gêneros remapeados (Corrida→racing, Espaço→simulation + tag space, Artilharia→strategy + tag artillery, FPS→shooter, Plataforma→platformer). `ai` do tau-control convertido em lista.
  - Links: os 13 endereços responderam 200 em 2026-11-19 (só status HTTP; não abri os jogos). Moongate redireciona para `play.moongate.page`, que virou o `play_url`. Afterglow 86 usava `?unlockall` (destrava tudo); troquei pela URL limpa.
  - Páginas novas: `/games/<dev>/<jogo>` e `/dev/<dev>` (jogos de cada desenvolvedor). Filtro novo "No ads" (só mostra jogos com `ads: false` confirmado; hoje nenhum). Corrigido bug do contador de filtros (somava texto).
  - Conferido no navegador em 375 px: catálogo (11 jogos), cada filtro bate com os dados, busca, página do jogo, página do desenvolvedor, sem rolagem horizontal.
  - Imagens do tau-control (`public/indie/*.webp`) **não** importadas: sem confirmação de permissão.
- 2026-11-19 (1ª entrega): site mínimo em `~/code/tabcade` (pasta provisória; `tabcade.com` está ocupado). Astro 7, estático, só `astro` de dependência. Sem git, sem commit. Catálogo com busca e filtros, página do jogo (Jogar abre o site do autor em nova aba, sem iframe), biblioteca em `localStorage`, about, 404, sitemap, robots, canônica sem `.html`, `wrangler.jsonc` igual ao do botanolapis. Rodar local: `npm run dev` (config `dev` em `.claude/launch.json`, porta 4329; reiniciar o servidor depois de mexer em `src/content.config.ts`).
- 2026-11-19: o servidor de casa foi reinstalado e está sendo restaurado; a cópia do tau-control dele ficou inacessível por enquanto. `~/code/tau-control` neste PC é uma pasta vazia (não é clone).

## Nomes (.com livre em 2026-11-19, consulta RDAP da Verisign; pode mudar a qualquer hora)

- **tidecade.com**: tide + arcade (jogos que chegam com a maré do feed).
- **flotsamcade.com**: flotsam (o que fica boiando depois do naufrágio) + arcade.
- **tabfound.com**: "achado numa aba".
- Também livres: tabcomb, tabbeacon, tabsalvage, jetsamplay, gamedredge, cadeshelf. Ocupados: tabcade, webcade, playshelf, gamestash, pocketcade e outros óbvios.

## Discovery

- **Reddit (lido em 2026-11-19, páginas oficiais):** Data API Wiki (support.reddithelp.com, artigo 16160319875092) e Responsible Builder Policy (artigo 42728983564564). Exige pedido e aprovação explícita antes de qualquer acesso; OAuth obrigatório e tráfego sem OAuth é bloqueado; 100 consultas/min por client id (média de 10 min); User-Agent `<plataforma>:<app>:<versão> (by /u/<usuário>)`; apagar em até 48 h o que foi apagado no Reddit; proibido comercializar ou treinar IA. Teste com curl: `.json` deu 403, `.rss` deu 404/429. **Conclusão:** não automatizar o Reddit sem aprovação. Pedido de acesso é cadastro (dona). Até lá, Reddit manual: a dona cola o link do post na fila.
- **itch.io:** feed RSS oficial (acrescentar `.xml` a qualquer página de listagem, documentado em itch.io/docs/api/overview). `https://itch.io/games/newest/platform-web.xml` respondeu 200 com jogos web. `robots.txt` não bloqueia `/games`. Termos de uso do itch.io não lidos.
- **Show HN:** API pública do Algolia (`hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=...`) respondeu 200. Termos não lidos.
- Por fazer: script de fila (itch.io + HN automáticos, Reddit por link manual), aprovação manual, sem nada entrar no catálogo sozinho.

## O que falta verificar

- [ ] Se o pi5 tem jogos além dos 11 do GitHub.
- [ ] `ads` e `purchases` dos 11 jogos (todos `unknown`). Autores de Cruising Bones e Grav Wars. Nome pessoal por trás de Wonky's Arcade e Moongate (se quiserem ser creditados assim). Posts do Reddit de todos os jogos.
- [ ] Os jogos abrem e rodam (só conferi status 200).
- [ ] Workflow de PR (só roda quando houver repositório).
- [ ] Termos de uso do itch.io e do Algolia/HN para leitura automatizada.
- [ ] Se o Reddit aprova uso não comercial assim (formulário de pedido não testado).
- [ ] Leitor de tela; tema escuro conferido só pelo CSS, não no navegador.

## Decisões

- Inglês; estático; sem login, sem anúncios, sem cookies; biblioteca em `localStorage`.
- "Jogar" sempre abre o site do autor; nada de iframe sem permissão.
- Curadoria manual: nada entra sem aprovação da dona (merge do PR).
- Catálogo = manifestos YAML por desenvolvedor, enviados por PR; o build é a validação.

## Depois

Script de discovery com fila, formulário de issue no GitHub para quem não sabe fazer PR (gera o YAML), feed "novos esta semana", JSON Schema para autocompletar o YAML no editor, português.
