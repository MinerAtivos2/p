/* ==========================================================================
   Sistema de Categorização de Soluções de IA — Backend Google Apps Script
   ==========================================================================
   Este script atua como API backend serverless para o sistema estático no GitHub Pages.

   COMO INSTALAR:
   1. Crie uma nova Planilha Google (Google Sheet).
   2. No menu superior, vá em "Extensões" > "Apps Script".
   3. Apague todo o código existente e cole este conteúdo.
   4. Salve e nomeie como "IA-Categorizacao-Backend".
   5. Clique em "Implantar" > "Nova implantação".
   6. Selecione o tipo "App da Web".
   7. Em "Executar como", selecione "Eu".
   8. Em "Quem tem acesso", selecione "Qualquer pessoa".
   9. Clique em "Implantar", autorize o acesso e COPIE a "URL do app da Web".
   10. Cole essa URL no arquivo 'app.js' do projeto.

   ESTRUTURA DA PLANILHA (O script cria automaticamente se não existirem):
   - Users: [ID, Username, Password, Empresa, Is_Admin]
   - Leads: [Email, Empresa, Timestamp]
   - Inventario: [ID, User_ID, Username, Empresa, Project_Data, Updated_At]
   ========================================================================== */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  const result = processRequest(e);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "API Online",
    message: "Backend de Categorização de Soluções de IA ativo. Use requisições POST."
  })).setMimeType(ContentService.MimeType.JSON);
}

function processRequest(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return { error: "Dados inválidos recebidos no formato JSON." };
  }

  const action = data.action;

  if (action === "login") {
    return handleLogin(data.username, data.password);
  } else if (action === "add_lead" || action === "request_community") {
    return handleAddLead(data.email, data.empresa);
  } else if (action === "get_inventory") {
    return handleGetInventory(data.username, data.session_token);
  } else if (action === "save_project") {
    return handleSaveProject(data.username, data.session_token, data.project);
  } else if (action === "delete_project") {
    return handleDeleteProject(data.username, data.session_token, data.project_id);
  } else if (action === "update_password") {
    return handleUpdatePassword(data.username, data.old_password, data.new_password);
  } else if (action === "status") {
    return handleStatus(data.username, data.session_token);
  }

  return { error: "Ação não reconhecida: " + action };
}

// --- Funções de Banco de Dados (Google Sheets) ---

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    if (name === "Leads") {
      sheet = ss.insertSheet("Leads");
      sheet.appendRow(["Email", "Empresa", "Timestamp"]);
    } else if (name === "Users") {
      sheet = ss.insertSheet("Users");
      sheet.appendRow(["ID", "Username", "Password", "Empresa", "Is_Admin"]);
      // Usuário inicial padrão para testes
      sheet.appendRow(["1", "membro", "membro123", "Minha Empresa", "0"]);
    } else if (name === "Inventario") {
      sheet = ss.insertSheet("Inventario");
      sheet.appendRow(["ID", "User_ID", "Username", "Empresa", "Project_Data", "Updated_At"]);
    }
  }
  return sheet;
}

function findUser(username) {
  if (!username) return null;
  const sheet = getSheet("Users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase() === String(username).toLowerCase()) {
      return {
        id: data[i][0],
        username: data[i][1],
        password: data[i][2],
        empresa: data[i][3] || "",
        is_admin: data[i][4] == 1 || data[i][4] === true || data[i][4] === "1"
      };
    }
  }
  return null;
}

// --- Handlers ---

function handleLogin(username, password) {
  const user = findUser(username);
  if (user && String(user.password) === String(password)) {
    const token = Utilities.base64Encode(user.username + ":" + new Date().getTime());
    return {
      success: true,
      username: user.username,
      empresa: user.empresa,
      is_admin: user.is_admin,
      session_token: token
    };
  }
  return { error: "Usuário ou senha inválidos." };
}

function handleStatus(username, token) {
  if (!username || !token) return { logged_in: false };
  const user = findUser(username);
  if (user) {
    return { logged_in: true, username: user.username, empresa: user.empresa, is_admin: user.is_admin };
  }
  return { logged_in: false };
}

function handleAddLead(email, empresa) {
  if (!email) return { error: "E-mail é obrigatório." };
  const sheet = getSheet("Leads");
  sheet.appendRow([email, empresa || "", new Date().toISOString()]);
  return { success: true, message: "Solicitação enviada com sucesso! Entraremos em contato para liberar seu acesso." };
}

function handleGetInventory(username, token) {
  const user = findUser(username);
  if (!user) return { error: "Não autorizado. Faça login novamente." };

  const sheet = getSheet("Inventario");
  const data = sheet.getDataRange().getValues();
  const projects = [];

  for (let i = 1; i < data.length; i++) {
    const rowUserId = String(data[i][1]);
    const rowUsername = String(data[i][2]).toLowerCase();
    if (rowUserId === String(user.id) || rowUsername === String(user.username).toLowerCase()) {
      try {
        const projData = JSON.parse(data[i][4]);
        projData.id = data[i][0];
        projData.updated_at = data[i][5];
        projects.push(projData);
      } catch (e) {
        // Ignora JSONs corrompidos se houver
      }
    }
  }

  return { success: true, projects: projects, empresa: user.empresa };
}

function handleSaveProject(username, token, project) {
  const user = findUser(username);
  if (!user) return { error: "Não autorizado. Faça login novamente." };
  if (!project) return { error: "Dados do projeto não fornecidos." };

  const sheet = getSheet("Inventario");
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const projectId = project.id || ("proj_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000));

  project.id = projectId;
  project.user_id = user.id;
  project.username = user.username;
  project.empresa = user.empresa;

  const projectStr = JSON.stringify(project);

  // Atualização se já existir
  for (let i = 1; i < data.length; i++) {
    const rowProjId = String(data[i][0]);
    const rowUserId = String(data[i][1]);
    const rowUsername = String(data[i][2]).toLowerCase();

    if (rowProjId === String(projectId) && (rowUserId === String(user.id) || rowUsername === String(user.username).toLowerCase())) {
      sheet.getRange(i + 1, 5).setValue(projectStr);
      sheet.getRange(i + 1, 6).setValue(now);
      return { success: true, project: project, message: "Projeto atualizado no inventário!" };
    }
  }

  // Novo projeto
  sheet.appendRow([projectId, user.id, user.username, user.empresa || "", projectStr, now]);
  return { success: true, project: project, message: "Projeto cadastrado com sucesso no inventário!" };
}

function handleDeleteProject(username, token, projectId) {
  const user = findUser(username);
  if (!user) return { error: "Não autorizado." };

  const sheet = getSheet("Inventario");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowProjId = String(data[i][0]);
    const rowUserId = String(data[i][1]);
    const rowUsername = String(data[i][2]).toLowerCase();

    if (rowProjId === String(projectId) && (rowUserId === String(user.id) || rowUsername === String(user.username).toLowerCase())) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Projeto removido do inventário com sucesso." };
    }
  }

  return { error: "Projeto não encontrado no seu inventário." };
}

function handleUpdatePassword(username, oldPassword, newPassword) {
  const sheet = getSheet("Users");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase() === String(username).toLowerCase()) {
      if (String(data[i][2]) === String(oldPassword)) {
        sheet.getRange(i + 1, 3).setValue(newPassword);
        return { success: true, message: "Senha alterada com sucesso!" };
      } else {
        return { error: "Senha atual incorreta." };
      }
    }
  }
  return { error: "Usuário não encontrado." };
}
