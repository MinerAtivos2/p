# Configuração do Backend Google Sheets — Sistema de Categorização de Soluções de IA

Este projeto é hospedado de forma 100% estática (ex: GitHub Pages) e utiliza o **Google Sheets** com **Google Apps Script** como banco de dados e API serverless para autenticação, solicitação de membros (leads) e inventário de projetos.

---

## 1. Estrutura da Planilha Google

Crie uma nova [Planilha Google](https://sheets.new) com três abas (páginas):

### Aba 1: `Users`
| Column | Nome do Campo | Descrição |
|---|---|---|
| A | `ID` | Identificador único do usuário (ex: `1`, `2`) |
| B | `Username` | Nome de usuário para login |
| C | `Password` | Senha |
| D | `Empresa` | Nome da empresa/organização do usuário |
| E | `Is_Admin` | `1` para admin ou `0` para membro comum |

*Exemplo de linha para testes:*
`1 | membro | membro123 | Minha Empresa Corp | 0`

---

### Aba 2: `Leads`
| Column | Nome do Campo | Descrição |
|---|---|---|
| A | `Email` | E-mail do solicitante |
| B | `Empresa` | Nome da empresa informada no cadastro |
| C | `Timestamp` | Data/Hora da solicitação |

---

### Aba 3: `Inventario`
| Column | Nome do Campo | Descrição |
|---|---|---|
| A | `ID` | ID do projeto (ex: `proj_1712345678_123`) |
| B | `User_ID` | ID do usuário proprietário do registro |
| C | `Username` | Nome de usuário |
| D | `Empresa` | Nome da empresa do usuário |
| E | `Project_Data` | Objeto JSON completo da ficha do projeto |
| F | `Updated_At` | Data/Hora da última atualização |

---

## 2. Instalação e Implantação do Script (Google Apps Script)

1. Na sua Planilha Google, acesse **Extensões > Apps Script**.
2. Apague qualquer código existente e cole o conteúdo do arquivo `api.gs` localizado nesta pasta.
3. Salve o projeto no Apps Script dando o nome de `IA-Categorizacao-Backend`.
4. Clique no botão azul **Implantar > Nova implantação**.
5. Selecione o tipo **App da Web**.
6. Ajuste as configurações:
   - **Descrição:** `API do Sistema de Categorização de IA`
   - **Executar como:** `Eu` (sua conta Google)
   - **Quem tem acesso:** `Qualquer pessoa` *(Necessário para o site estático realizar requisições CORS)*
7. Clique em **Implantar** e autorize os acessos solicitados pela sua conta.
8. Copie a **URL do App da Web** gerada (formato `https://script.google.com/macros/s/.../exec`).

---

## 3. Conexão com o Frontend (`app.js`)

1. Abra o arquivo `categorias/app.js`.
2. Localize a propriedade `this.GAS_URL` no construtor da classe `App`.
3. Substitua pela sua URL:
   ```javascript
   this.GAS_URL = "https://script.google.com/macros/s/SUA_URL_AQUI/exec";
   ```
4. Salve e publique a alteração.

---

> 💡 **Nota Importante:** Caso realize alterações no código do Apps Script posteriormente, lembre-se de ir em **Implantar > Gerenciar implantações**, clicar no ícone de lápis ✏️ e escolher **"Nova versão"** antes de clicar em Implantar.
