const { test, expect } = require('@playwright/test');

test.describe('Painel Admin (admin.html)', () => {

  test.beforeEach(async ({ page }) => {
    // Como configuramos as credenciais no playwright.config, o login é automático
    await page.goto('/admin.html');
  });

  test('Deve carregar a página e autenticar com sucesso (Basic Auth bypass)', async ({ page }) => {
    await expect(page).toHaveTitle(/Painel de Controle - Buffon/);
    
    // Verifica se o logo/título no topo carregou
    const logo = page.locator('.header-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('BUFFON');
  });

  test('Deve testar mudanças de texto (Inputs)', async ({ page }) => {
    // Aba Configurações (Padrão)
    const phoneInput = page.locator('#config-phone');
    await phoneInput.fill('(51) 98888-7777');
    await expect(phoneInput).toHaveValue('(51) 98888-7777');

    // Aba Hero
    await page.getByRole('button', { name: /Banner Principal/i }).click();
    const heroTitle = page.locator('#hero-title');
    await heroTitle.fill('Novo Título de Teste');
    await expect(heroTitle).toHaveValue('Novo Título de Teste');
  });

  test('Deve testar o upload de imagens e preview', async ({ page }) => {
    // Vai para Banner Principal (que possui uploads de imagem de fundo)
    await page.getByRole('button', { name: /Banner Principal/i }).click();

    // Inicia a escuta para o file chooser antes de clicar
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Clica no botão para abrir o file chooser da Imagem 1
    await page.locator('button').filter({ hasText: 'Alterar Foto 1' }).click();
    
    // Anexa a imagem de teste
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/test-image.png');

    // Verifica se a tag img foi injetada no container de preview indicando sucesso no upload
    const previewContainer = page.locator('#preview-bg-0');
    await expect(previewContainer.locator('img')).toBeVisible();
  });

  test('Deve testar os toggles de visibilidade das seções', async ({ page }) => {
    // Na aba Configurações
    const contactVisibility = page.locator('#visibility-contact');
    
    // Por padrão pode estar marcado. Vamos clicar no checkbox (via label para evitar issues de interceptação)
    await page.locator('label[for="visibility-contact"]').click();
    
    // O estado agora deve estar desmarcado (ou trocado)
    // Para simplificar, desmarcamos explicitamente usando o método uncheck
    await contactVisibility.uncheck();
    await expect(contactVisibility).not.toBeChecked();

    // Marcar novamente
    await contactVisibility.check();
    await expect(contactVisibility).toBeChecked();

    // Testa em outra aba
    await page.getByRole('button', { name: /Estatísticas/i }).click();
    const statsVisibility = page.locator('#visibility-stats');
    await statsVisibility.uncheck();
    await expect(statsVisibility).not.toBeChecked();
  });

  test('Deve exibir a aba de Salvar e interagir com o botão de download', async ({ page }) => {
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    await expect(page.locator('#salvar')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Baixar Arquivo data.js/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('data.js');
  });

});
