/* ==========================================================================
   Sistema de Categorização e Taxonomia de Soluções de IA — Client Frontend
   ========================================================================== */

class App {
  constructor() {
    // URL do Google Apps Script (substituir após a implantação na planilha)
    this.GAS_URL = "https://script.google.com/macros/s/AKfycby_placeholder_gas_url/exec";

    this.user = null; // { username, empresa, session_token }
    this.inventory = [];
    this.currentWizardStep = 1;
    this.wizardAnswers = {};

    this.init();
  }

  async init() {
    this.bindUI();
    this.checkSessionCookie();
    this.recalculateFichaResults();

    if (this.user) {
      await this.verifyAuthStatus();
      this.loadUserInventory();
    } else {
      this.updateAuthUI();
    }
  }

  /* ------------------------------------------------------------------
     Cookie & Session Management (Baseado no padrão do app.js de referência)
  ------------------------------------------------------------------ */
  setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }

  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }

  checkSessionCookie() {
    const savedUser = this.getCookie('tax_user') || localStorage.getItem('tax_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        this.user = null;
      }
    }
  }

  saveUserSession(userObj) {
    this.user = userObj;
    const str = JSON.stringify(userObj);
    this.setCookie('tax_user', str, 7);
    localStorage.setItem('tax_user', str);
    this.updateAuthUI();
  }

  clearUserSession() {
    this.user = null;
    this.deleteCookie('tax_user');
    localStorage.removeItem('tax_user');
    this.inventory = [];
    this.updateAuthUI();
  }

  /* ------------------------------------------------------------------
     UI Event Bindings
  ------------------------------------------------------------------ */
  bindUI() {
    // Navigation / Header
    const hamburgerBtn = this.$('hamburgerBtn');
    const mainNav = this.$('mainNav');
    if (hamburgerBtn && mainNav) {
      hamburgerBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
      });
    }

    // Modal Triggers
    const btnLoginOpen = this.$('btnLoginOpen');
    if (btnLoginOpen) btnLoginOpen.addEventListener('click', () => this.openModal('modalLogin'));

    const btnRequestCommunityOpen = this.$('btnRequestCommunityOpen');
    if (btnRequestCommunityOpen) btnRequestCommunityOpen.addEventListener('click', () => this.openModal('modalCommunity'));

    const btnLogout = this.$('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', () => this.logout());

    const btnLockedLogin = this.$('btnLockedLogin');
    if (btnLockedLogin) btnLockedLogin.addEventListener('click', () => this.openModal('modalLogin'));

    const btnLockedCommunity = this.$('btnLockedCommunity');
    if (btnLockedCommunity) btnLockedCommunity.addEventListener('click', () => this.openModal('modalCommunity'));

    const btnInventoryGuestLogin = this.$('btnInventoryGuestLogin');
    if (btnInventoryGuestLogin) btnInventoryGuestLogin.addEventListener('click', () => this.openModal('modalLogin'));

    const btnHeroWizard = this.$('btnHeroWizard');
    if (btnHeroWizard) btnHeroWizard.addEventListener('click', () => this.startWizard());

    const btnOpenWizardModal = this.$('btnOpenWizardModal');
    if (btnOpenWizardModal) btnOpenWizardModal.addEventListener('click', () => this.startWizard());

    const btnOpenDirectFichaModal = this.$('btnOpenDirectFichaModal');
    if (btnOpenDirectFichaModal) btnOpenDirectFichaModal.addEventListener('click', () => this.openFichaModal());

    // Modal Close buttons
    document.querySelectorAll('.closeModalBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-modal');
        if (modalId) this.closeModal(modalId);
      });
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('show');
        }
      });
    });

    // Form Submissions
    const formLogin = this.$('formLogin');
    if (formLogin) formLogin.addEventListener('submit', (e) => this.handleLoginSubmit(e));

    const formCommunity = this.$('formCommunity');
    if (formCommunity) formCommunity.addEventListener('submit', (e) => this.handleCommunitySubmit(e));

    const formFicha = this.$('formFicha');
    if (formFicha) formFicha.addEventListener('submit', (e) => this.handleFichaSubmit(e));

    // Wizard Navigation
    const btnWizardNext = this.$('btnWizardNext');
    if (btnWizardNext) btnWizardNext.addEventListener('click', () => this.handleWizardNext());

    const btnWizardPrev = this.$('btnWizardPrev');
    if (btnWizardPrev) btnWizardPrev.addEventListener('click', () => this.handleWizardPrev());

    // Live calculation listeners on Ficha form
    document.querySelectorAll('.trigger-calc, #fDadoSensivel, #fDominioSensivel').forEach(el => {
      el.addEventListener('change', () => this.recalculateFichaResults());
    });
  }

  $(id) {
    return document.getElementById(id);
  }

  openModal(id) {
    const modal = this.$(id);
    if (modal) modal.classList.add('show');
  }

  closeModal(id) {
    const modal = this.$(id);
    if (modal) modal.classList.remove('show');
  }

  toast(message, type = 'info') {
    const container = this.$('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ------------------------------------------------------------------
     Authentication & Authorization Logic
  ------------------------------------------------------------------ */
  updateAuthUI() {
    const guestActions = this.$('guestActions');
    const memberActions = this.$('memberActions');
    const conceptsLockedBanner = this.$('conceptsLockedBanner');
    const conceptsUnlockedContent = this.$('conceptsUnlockedContent');
    const inventoryGuestBanner = this.$('inventoryGuestBanner');
    const inventoryMemberArea = this.$('inventoryMemberArea');

    if (this.user) {
      if (guestActions) guestActions.style.display = 'none';
      if (memberActions) memberActions.style.display = 'flex';

      const memberUserName = this.$('memberUserName');
      const memberEmpresa = this.$('memberEmpresa');
      if (memberUserName) memberUserName.textContent = this.user.username;
      if (memberEmpresa) memberEmpresa.textContent = this.user.empresa || 'Empresa';

      if (conceptsLockedBanner) conceptsLockedBanner.style.display = 'none';
      if (conceptsUnlockedContent) conceptsUnlockedContent.style.display = 'block';

      if (inventoryGuestBanner) inventoryGuestBanner.style.display = 'none';
      if (inventoryMemberArea) inventoryMemberArea.style.display = 'block';
    } else {
      if (guestActions) guestActions.style.display = 'flex';
      if (memberActions) memberActions.style.display = 'none';

      if (conceptsLockedBanner) conceptsLockedBanner.style.display = 'block';
      if (conceptsUnlockedContent) conceptsUnlockedContent.style.display = 'none';

      if (inventoryGuestBanner) inventoryGuestBanner.style.display = 'block';
      if (inventoryMemberArea) inventoryMemberArea.style.display = 'none';
    }
  }

  /* Helper para envios sem problemas de CORS no Google Apps Script Web App */
  async apiPost(payload) {
    if (!this.GAS_URL || this.GAS_URL.includes('placeholder')) {
      throw new Error("URL do Apps Script não configurada.");
    }

    // Google Apps Script requer 'text/plain' para evitar preflight OPTIONS CORS no browser
    const res = await fetch(this.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    return await res.json();
  }

  async verifyAuthStatus() {
    if (!this.GAS_URL || this.GAS_URL.includes('placeholder')) return;
    try {
      const data = await this.apiPost({
        action: 'status',
        username: this.user.username,
        session_token: this.user.session_token
      });
      if (!data.logged_in) {
        this.clearUserSession();
      }
    } catch (e) {
      console.warn('Erro ao verificar status com backend GAS:', e);
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const username = this.$('loginUsername').value.trim();
    const password = this.$('loginPassword').value.trim();

    if (!username || !password) {
      this.toast('Preencha usuário e senha.', 'error');
      return;
    }

    if (this.GAS_URL.includes('placeholder')) {
      // Demo local fallback para testes sem URL do Apps Script
      this.saveUserSession({
        username: username,
        empresa: "Empresa Demonstração",
        session_token: "demo_token_" + Date.now()
      });
      this.closeModal('modalLogin');
      this.toast(`Bem-vindo, ${username}! (Modo Demonstração)`, 'success');
      this.loadUserInventory();
      return;
    }

    try {
      const data = await this.apiPost({ action: 'login', username, password });

      if (data.success) {
        this.saveUserSession({
          username: data.username,
          empresa: data.empresa || "",
          session_token: data.session_token
        });
        this.closeModal('modalLogin');
        this.toast(`Bem-vindo, ${data.username}!`, 'success');
        this.loadUserInventory();
      } else {
        this.toast(data.error || 'Usuário ou senha inválidos.', 'error');
      }
    } catch (err) {
      console.error('Erro de API no Login:', err);
      this.toast(`Erro na comunicação com o servidor: ${err.message || 'Verifique o deploy do Apps Script (Acesso: Qualquer Pessoa)'}`, 'error');
    }
  }

  async handleCommunitySubmit(e) {
    e.preventDefault();
    const email = this.$('commEmail').value.trim();
    const empresa = this.$('commEmpresa').value.trim();

    if (!email || !empresa) {
      this.toast('Por favor, informe seu e-mail e empresa.', 'error');
      return;
    }

    if (this.GAS_URL.includes('placeholder')) {
      this.closeModal('modalCommunity');
      this.toast('Solicitação registrada no modo demonstração com sucesso!', 'success');
      return;
    }

    try {
      const data = await this.apiPost({ action: 'request_community', email, empresa });

      if (data.success) {
        this.closeModal('modalCommunity');
        this.toast(data.message || 'Solicitação enviada com sucesso!', 'success');
      } else {
        this.toast(data.error || 'Erro ao enviar solicitação.', 'error');
      }
    } catch (err) {
      console.error('Erro de API na Comunidade:', err);
      this.toast(`Erro ao comunicar com o servidor: ${err.message}`, 'error');
    }
  }

  logout() {
    this.clearUserSession();
    this.toast('Você encerrou a sessão.', 'info');
  }

  /* ------------------------------------------------------------------
     TAXONOMIA BUSINESS LOGIC (Calculos determinísticos RN-001 a RN-240)
  ------------------------------------------------------------------ */
  calculateTaxonomyResults(inputs) {
    const { N, NC, F, A, E, P, H, dadoSensivel, dominioSensivel } = inputs;

    // RN-110: Algoritmo de Cálculo da Classe
    let classe = "";
    if (!N || !F || !A || !E || !H) {
      classe = "— preencha os eixos —";
    } else if (F === "F3") {
      classe = "C5";
    } else if (F === "F2") {
      classe = "C4";
    } else if (N === "N0") {
      classe = "C0";
    } else if (F === "F1") {
      classe = "C3";
    } else if (N === "N1") {
      classe = "C1";
    } else {
      classe = "C2"; // N2 ou N3 com F0
    }

    // Nomes oficiais das classes
    const classNames = {
      "C0": "Automação Determinística",
      "C1": "Automação com Modelo Preditivo Embarcado",
      "C2": "Automação com IA Generativa Embarcada",
      "C3": "Automação/Workflow com Roteamento por Modelo",
      "C4": "Agente de Autonomia Limitada",
      "C5": "Sistema Multiagente"
    };
    const denomOficial = classNames[classe] || "Não enquadrada";

    // RN-140 a RN-144: Montagem da Assinatura
    let nSignature = N;
    if (NC === "NC1") {
      nSignature = N === "N3" ? "N3+N1" : "N2+N1";
    } else if (NC === "NC2") {
      nSignature = "N1+N1";
    }
    const assinatura = `${classe} · ${nSignature}·${F}·${A}·${E}·${P}·${H}`;

    // RN-200 / RN-201: Grau de Criticidade
    let grau = "G1";
    if (E === "E2" || (dominioSensivel && dominioSensivel !== "")) {
      grau = "G3";
    } else if (E === "E1" || dadoSensivel === "Sim") {
      grau = "G2";
    } else {
      grau = "G1";
    }

    const grauLabels = {
      "G1": "G1 — Baixo",
      "G2": "G2 — Médio",
      "G3": "G3 — Alto"
    };

    // RN-222: Supervisão Mínima Exigida
    let supervisaoMin = "H1 — Humano sobre o laço";
    if (classe === "C0") {
      supervisaoMin = "Sem exigência";
    } else if (classe === "C5") {
      supervisaoMin = "H0 — Humano no laço (+ aprovação formal)";
    } else if (grau === "G3" || E === "E1" || E === "E2") {
      supervisaoMin = "H0 — Humano no laço";
    }

    // RN-230: Teto de Consumo Obrigatório
    const tetoObrig = ["C3", "C4", "C5"].includes(classe) ? "SIM — Declarar teto e alerta" : "Não obrigatório";

    // RN-239 / 6.6: Estratégia de Saída (Lock-in / Eixo D)
    const D = inputs.D || "D0";
    let estrategiaSaida = "Não exigida";
    if (D === "D3" || (D === "D2" && grau === "G3")) {
      estrategiaSaida = "SIM — Documentar e obter aceite de risco";
    }

    // RN-120 a RN-129: Validações de Coerência
    const coerenciaViolations = [];

    if (NC === "NC1" && !["N2", "N3"].includes(N)) {
      coerenciaViolations.push("RN-121: NC1 (composição híbrida) exige N2 ou N3 no eixo N.");
    }
    if (NC === "NC2" && N !== "N1") {
      coerenciaViolations.push("RN-122: NC2 pressupõe N1 como nível mais alto no eixo N.");
    }
    if (N === "N0" && NC !== "NC0") {
      coerenciaViolations.push("RN-123: Solução determinística N0 não possui composição híbrida.");
    }
    if (N === "N0" && F !== "F0") {
      coerenciaViolations.push("RN-124: Solução determinística N0 não pode ter decisões de fluxo F1/F2/F3.");
    }
    if (["E1", "E2"].includes(E) && H !== "H0") {
      coerenciaViolations.push("RN-125: Ações executoras E1/E2 exigem supervisão H0 (humano no laço).");
    }
    if (H === "H2" && E !== "E0") {
      coerenciaViolations.push("RN-126: Supervisão H2 (humano fora do laço) só é admissível para efeito assistivo E0.");
    }

    return {
      classe,
      denomOficial,
      assinatura,
      grau: grauLabels[grau] || grau,
      grauCode: grau,
      supervisaoMin,
      tetoObrig,
      estrategiaSaida,
      coerenciaValid: coerenciaViolations.length === 0,
      coerenciaMessages: coerenciaViolations
    };
  }

  recalculateFichaResults() {
    const inputs = {
      N: this.$('fEixoN')?.value,
      NC: this.$('fEixoNC')?.value,
      F: this.$('fEixoF')?.value,
      A: this.$('fEixoA')?.value,
      E: this.$('fEixoE')?.value,
      P: this.$('fEixoP')?.value,
      H: this.$('fEixoH')?.value,
      D: this.$('fEixoD')?.value,
      dadoSensivel: this.$('fDadoSensivel')?.value,
      dominioSensivel: this.$('fDominioSensivel')?.value
    };

    const res = this.calculateTaxonomyResults(inputs);

    if (this.$('rClasse')) this.$('rClasse').textContent = `${res.classe} — ${res.denomOficial}`;
    if (this.$('rAssinatura')) this.$('rAssinatura').textContent = res.assinatura;
    if (this.$('rGrau')) this.$('rGrau').textContent = res.grau;
    if (this.$('rSupervisaoMin')) this.$('rSupervisaoMin').textContent = res.supervisaoMin;
    if (this.$('rTetoObrig')) this.$('rTetoObrig').textContent = res.tetoObrig;
    if (this.$('rEstrategiaSaida')) this.$('rEstrategiaSaida').textContent = res.estrategiaSaida;

    const coerenciaBox = this.$('rCoerenciaBox');
    if (coerenciaBox) {
      if (res.coerenciaValid) {
        coerenciaBox.className = 'coherence-box coherence-ok';
        coerenciaBox.innerHTML = `<span>✅ Coerência da Classificação: <strong>OK</strong></span>`;
      } else {
        coerenciaBox.className = 'coherence-box coherence-adjust';
        coerenciaBox.innerHTML = `<span>⚠️ AJUSTAR — ${res.coerenciaMessages.join(" | ")}</span>`;
      }
    }

    return res;
  }

  /* ------------------------------------------------------------------
     Wizard Assistance Logic (9 Questions)
  ------------------------------------------------------------------ */
  startWizard() {
    if (!this.user) {
      this.toast('Faça login como membro para usar o assistente e categorizar.', 'warning');
      this.openModal('modalLogin');
      return;
    }
    this.currentWizardStep = 1;
    this.wizardAnswers = {};
    this.updateWizardStepView();
    this.openModal('modalWizard');
  }

  updateWizardStepView() {
    document.querySelectorAll('.wizard-step').forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      step.classList.toggle('active', stepNum === this.currentWizardStep);
    });

    document.querySelectorAll('.wizard-step-indicator').forEach((ind, i) => {
      const stepIdx = i + 1;
      ind.classList.remove('active', 'completed');
      if (stepIdx === this.currentWizardStep) {
        ind.classList.add('active');
      } else if (stepIdx < this.currentWizardStep) {
        ind.classList.add('completed');
      }
    });

    const progressPercent = ((this.currentWizardStep - 1) / 8) * 100;
    const progressFill = this.$('wizardProgressFill');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    const btnPrev = this.$('btnWizardPrev');
    const btnNext = this.$('btnWizardNext');
    if (btnPrev) btnPrev.style.display = this.currentWizardStep > 1 ? 'inline-flex' : 'none';
    if (btnNext) btnNext.textContent = this.currentWizardStep === 9 ? 'Finalizar e Preencher Ficha' : 'Próximo';
  }

  handleWizardNext() {
    // Capture step answer
    const currentStepEl = document.querySelector(`.wizard-step[data-step="${this.currentWizardStep}"]`);
    if (currentStepEl) {
      const selected = currentStepEl.querySelector('input[type="radio"]:checked');
      if (selected) {
        this.wizardAnswers[`Q${this.currentWizardStep}`] = selected.value;
      }
    }

    if (this.currentWizardStep < 9) {
      this.currentWizardStep++;
      this.updateWizardStepView();
    } else {
      // Final step -> Apply Wizard choices to Ficha
      this.applyWizardToFicha();
      this.closeModal('modalWizard');
      this.openFichaModal();
      this.toast('Ficha pré-preenchida pelo assistente!', 'success');
    }
  }

  handleWizardPrev() {
    if (this.currentWizardStep > 1) {
      this.currentWizardStep--;
      this.updateWizardStepView();
    }
  }

  applyWizardToFicha() {
    const a = this.wizardAnswers;

    // Q1: N0 or Model
    let N = "N2";
    if (a.Q1 === "nao") {
      N = "N0";
    } else {
      N = a.Q3 || "N2";
    }

    const NC = a.Q2 || "NC0";

    let F = "F0";
    if (N === "N0") {
      F = "F0";
    } else if (a.Q4 === "F0") {
      F = "F0";
    } else if (a.Q5 === "F1") {
      F = "F1";
    } else if (a.Q6 === "F2") {
      F = "F2";
    } else if (a.Q6 === "F3") {
      F = "F3";
    } else {
      F = "F1";
    }

    const A = a.Q7 || "A0";
    const E = a.Q8 || "E0";
    const D = a.Q9 || "D0";

    if (this.$('fEixoN')) this.$('fEixoN').value = N;
    if (this.$('fEixoNC')) this.$('fEixoNC').value = NC;
    if (this.$('fEixoF')) this.$('fEixoF').value = F;
    if (this.$('fEixoA')) this.$('fEixoA').value = A;
    if (this.$('fEixoE')) this.$('fEixoE').value = E;
    if (this.$('fEixoD')) this.$('fEixoD').value = D;

    this.recalculateFichaResults();
  }

  /* ------------------------------------------------------------------
     Ficha Modal & Inventory Operations
  ------------------------------------------------------------------ */
  openFichaModal(projectToEdit = null) {
    if (!this.user) {
      this.toast('Faça login para cadastrar e gerenciar fichas de projetos.', 'warning');
      this.openModal('modalLogin');
      return;
    }

    const form = this.$('formFicha');
    if (form) form.reset();

    if (projectToEdit) {
      this.$('fichaModalTitle').textContent = "Editar Ficha de Classificação";
      this.$('fichaProjectId').value = projectToEdit.id || "";
      this.$('fNome').value = projectToEdit.nome || "";
      this.$('fVersao').value = projectToEdit.versao || "v1.0";
      this.$('fPO').value = projectToEdit.po || this.user.username;
      this.$('fEmpresaArea').value = projectToEdit.empresaArea || this.user.empresa || "";
      this.$('fDadoSensivel').value = projectToEdit.dadoSensivel || "Nao";
      this.$('fDominioSensivel').value = projectToEdit.dominioSensivel || "";
      this.$('fEixoN').value = projectToEdit.N || "N2";
      this.$('fEixoNC').value = projectToEdit.NC || "NC0";
      this.$('fEixoF').value = projectToEdit.F || "F0";
      this.$('fEixoA').value = projectToEdit.A || "A0";
      this.$('fEixoE').value = projectToEdit.E || "E0";
      this.$('fEixoP').value = projectToEdit.P || "P0";
      this.$('fEixoH').value = projectToEdit.H || "H0";
      this.$('fEixoD').value = projectToEdit.D || "D2";
      this.$('fJustificativa').value = projectToEdit.justificativa || "";
    } else {
      this.$('fichaModalTitle').textContent = "Cadastrar Nova Ficha de Classificação";
      this.$('fichaProjectId').value = "";
      this.$('fPO').value = this.user.username;
      this.$('fEmpresaArea').value = this.user.empresa || "";
    }

    this.recalculateFichaResults();
    this.openModal('modalFicha');
  }

  async handleFichaSubmit(e) {
    e.preventDefault();

    const inputs = {
      id: this.$('fichaProjectId').value || null,
      nome: this.$('fNome').value.trim(),
      versao: this.$('fVersao').value.trim(),
      po: this.$('fPO').value.trim(),
      empresaArea: this.$('fEmpresaArea').value.trim(),
      dadoSensivel: this.$('fDadoSensivel').value,
      dominioSensivel: this.$('fDominioSensivel').value,
      N: this.$('fEixoN').value,
      NC: this.$('fEixoNC').value,
      F: this.$('fEixoF').value,
      A: this.$('fEixoA').value,
      E: this.$('fEixoE').value,
      P: this.$('fEixoP').value,
      H: this.$('fEixoH').value,
      D: this.$('fEixoD').value,
      justificativa: this.$('fJustificativa').value.trim()
    };

    const calc = this.calculateTaxonomyResults(inputs);

    const projectData = {
      ...inputs,
      classe: calc.classe,
      denomOficial: calc.denomOficial,
      assinatura: calc.assinatura,
      grau: calc.grau,
      coerenciaValid: calc.coerenciaValid
    };

    if (this.GAS_URL.includes('placeholder')) {
      // Local fallback
      if (!projectData.id) {
        projectData.id = "proj_" + Date.now();
        this.inventory.push(projectData);
      } else {
        const idx = this.inventory.findIndex(p => p.id === projectData.id);
        if (idx !== -1) this.inventory[idx] = projectData;
      }
      this.closeModal('modalFicha');
      this.renderInventoryTable();
      this.toast('Projeto salvo com sucesso no inventário local!', 'success');
      return;
    }

    try {
      const data = await this.apiPost({
        action: 'save_project',
        username: this.user.username,
        session_token: this.user.session_token,
        project: projectData
      });

      if (data.success) {
        this.closeModal('modalFicha');
        this.toast(data.message || 'Projeto salvo no inventário!', 'success');
        this.loadUserInventory();
      } else {
        this.toast(data.error || 'Erro ao salvar projeto.', 'error');
      }
    } catch (err) {
      console.error('Erro de API ao Salvar Projeto:', err);
      this.toast(`Erro na transmissão com o servidor: ${err.message}`, 'error');
    }
  }

  async loadUserInventory() {
    if (!this.user) return;

    if (this.GAS_URL.includes('placeholder')) {
      this.renderInventoryTable();
      return;
    }

    try {
      const data = await this.apiPost({
        action: 'get_inventory',
        username: this.user.username,
        session_token: this.user.session_token
      });

      if (data.success) {
        this.inventory = data.projects || [];
        this.renderInventoryTable();
      } else {
        this.toast(data.error || 'Erro ao carregar inventário.', 'error');
      }
    } catch (err) {
      console.warn('Falha ao carregar inventário do servidor:', err);
    }
  }

  async deleteProject(projectId) {
    if (!confirm('Tem certeza que deseja excluir esta ficha de projeto?')) return;

    if (this.GAS_URL.includes('placeholder')) {
      this.inventory = this.inventory.filter(p => p.id !== projectId);
      this.renderInventoryTable();
      this.toast('Projeto removido do inventário local.', 'info');
      return;
    }

    try {
      const data = await this.apiPost({
        action: 'delete_project',
        username: this.user.username,
        session_token: this.user.session_token,
        project_id: projectId
      });

      if (data.success) {
        this.toast(data.message || 'Projeto removido.', 'info');
        this.loadUserInventory();
      } else {
        this.toast(data.error || 'Erro ao excluir projeto.', 'error');
      }
    } catch (err) {
      console.error('Erro de API ao Excluir Projeto:', err);
      this.toast(`Erro ao comunicar exclusão: ${err.message}`, 'error');
    }
  }

  renderInventoryTable() {
    const tbody = this.$('inventoryTableBody');
    const countText = this.$('inventoryCountText');
    if (!tbody) return;

    if (countText) {
      countText.textContent = `${this.inventory.length} projeto(s) cadastrado(s) para ${this.user ? this.user.username : ''}`;
    }

    if (!this.inventory || this.inventory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Nenhum projeto de IA cadastrado para o seu usuário ainda. Clique em "Cadastrar Nova Ficha" ou utilize o Wizard.</td></tr>`;
      return;
    }

    let html = "";
    this.inventory.forEach(p => {
      const classBadgeClass = `badge-${(p.classe || 'C0').toLowerCase()}`;
      const grauBadgeClass = `badge-${(p.grauCode || 'G1').toLowerCase()}`;
      const coherenceTag = p.coerenciaValid !== false
        ? `<span style="color: var(--success); font-weight: 600;">OK</span>`
        : `<span style="color: var(--danger); font-weight: 600;">AJUSTAR</span>`;

      const updatedAtStr = p.updated_at ? new Date(p.updated_at).toLocaleDateString('pt-BR') : 'Hoje';

      html += `
        <tr>
          <td><strong>${p.nome || 'Sem nome'}</strong><br><small style="color:var(--text-muted)">PO: ${p.po || '—'}</small></td>
          <td>${p.versao || 'v1.0'}</td>
          <td><span class="badge ${classBadgeClass}">${p.classe || 'C0'}</span></td>
          <td style="font-family: monospace; font-size: 0.82rem;">${p.assinatura || '—'}</td>
          <td><span class="badge ${grauBadgeClass}">${p.grau || 'G1'}</span></td>
          <td><strong style="color: var(--accent);">${p.D || 'D0'}</strong></td>
          <td>${coherenceTag}</td>
          <td>${updatedAtStr}</td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-outline btn-sm edit-proj-btn" data-id="${p.id}">✏️</button>
              <button class="btn btn-danger btn-sm del-proj-btn" data-id="${p.id}">🗑</button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Attach row action listeners
    tbody.querySelectorAll('.edit-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const proj = this.inventory.find(p => p.id === id);
        if (proj) this.openFichaModal(proj);
      });
    });

    tbody.querySelectorAll('.del-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (id) this.deleteProject(id);
      });
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
