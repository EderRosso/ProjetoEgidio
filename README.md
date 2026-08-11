# Buffon - Assistência Técnica Industrial

Este é o projeto do site institucional completo da **Buffon**, desenvolvido do zero com foco em alta performance, responsividade, design premium e SEO otimizado. O site foi construído utilizando **HTML5 semântico, CSS3 personalizado (vanilla) e JavaScript puro (ES6+)**, sem a necessidade de dependências ou CMS pesados.

---

## ⚡ Como Executar Localmente

Como o projeto é estático, você pode executá-lo diretamente no seu navegador de forma muito simples:

1. **Método Direto**:
   - Dê um duplo clique no arquivo `index.html` na raiz do projeto para abri-lo em qualquer navegador.

2. **Utilizando Servidor Local (Recomendado)**:
   - Se você estiver usando o VS Code, instale a extensão **Live Server** e clique em **"Go Live"** no canto inferior direito.
   - Alternativamente, se tiver o Node.js instalado, você pode executar o comando abaixo no terminal da pasta do projeto para rodar um servidor local leve:
     ```bash
     npx http-server
     ```
   - O site estará disponível em `http://localhost:8080`.

---

## 🎨 Guia de Personalização

O site foi estruturado para ser extremamente fácil de editar e personalizar. Siga os passos abaixo:

### 1. Paleta de Cores e Fontes (CSS)
Toda a identidade visual está concentrada em variáveis nativas do CSS no arquivo [css/style.css](file:///c:/Users/Dell%20G7/Documents/Projetos/ProjetoEgidio/css/style.css). 
Abra o arquivo e altere os valores dentro do bloco `:root` no início do documento:
* **--color-primary-dark**: Altera a cor do fundo principal.
* **--color-accent**: Altera a cor de destaque principal (atualmente laranja industrial).
* **--font-primary**: Define a tipografia principal (por padrão puxa a fonte do Google Fonts `Outfit` e `Inter`).

### 2. Informações Gerais e Textos (HTML)
As informações mutáveis que precisam de dados reais do negócio estão demarcadas com colchetes no arquivo [index.html](file:///c:/Users/Dell%20G7/Documents/Projetos/ProjetoEgidio/index.html). Abra o arquivo e utilize a ferramenta de busca do seu editor (Ctrl+F) para localizar os seguintes marcadores e substituí-los:
* `[TELEFONE DA BUFFON]`: Número de contato fixo ou celular exibido em texto.
* `[NUMERO_DO_WHATSAPP]`: Substitua pelo número do WhatsApp no formato internacional sem símbolos (ex: para (51) 99999-9999, use `5551999999999` no link do `wa.me`).
* `[EMAIL DA BUFFON]`: O e-mail de contato que aparece no rodapé e seção de contato.
* `[ENDEREÇO DA BUFFON - RUA, NÚMERO, BAIRRO]`: Endereço físico comercial da empresa.
* `[FAVICON_PLACEHOLDER]`: Substitua pelo link ou caminho do arquivo do seu favicon (ex: `assets/images/favicon.ico`).
* `[IMAGEM INSTITUCIONAL DA ASSISTÊNCIA TÉCNICA BUFFON]`: Substitua o bloco SVG da imagem por uma tag `<img>` contendo a foto real da sede ou da equipe.

### 3. Logotipos das Marcas Atendidas
Na seção de marcas (linha 226 do `index.html`), substitua as marcas indicadas por imagens reais dos logos das marcas ou mantenha a estilização em texto puro:
```html
<div class="brand-logo-item">[BOSCH]</div>
```

### 4. Configuração do Formulário de Contato (Formspree)
O formulário de contato está pronto para envio assíncrono via AJAX. Para torná-lo funcional:
1. Crie uma conta gratuita em [Formspree](https://formspree.io/).
2. Crie um novo formulário na sua dashboard e obtenha a URL de endpoint (ex: `https://formspree.io/f/xbjpenpd`).
3. No arquivo `index.html`, localize a tag `<form>` (aproximadamente na linha 336) e insira a URL no atributo `action`:
   ```html
   <form id="budget-form" action="https://formspree.io/f/SEU_ID_DO_FORMSPREE" method="POST">
   ```
4. Se o endpoint de email não for alterado, o JavaScript exibirá um alerta informativo simulando o envio e imprimindo os dados no console de desenvolvimento.

### 5. Localização no Google Maps
Na linha 316 do `index.html`, substitua o link existente dentro da propriedade `src` do `<iframe>` da seção de contato pela URL obtida no Google Maps (Menu Compartilhar > Incorporar um mapa > Copiar HTML, extraindo apenas o conteúdo do atributo `src`).

---

## 📈 Estrutura de SEO (Otimização para Busca)
O site já acompanha:
* **robots.txt**: Para guiar os indexadores de busca na varredura do site.
* **sitemap.xml**: Mapa do site para submissão direta no Google Search Console.
* **Tags Open Graph e Twitter Cards**: Configuradas no `<head>` do `index.html` para exibição premium das prévias ao compartilhar o site em redes sociais (WhatsApp, Facebook, LinkedIn).
