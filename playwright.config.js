const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    // Credenciais do .htpasswd simuladas pelo nosso test-server
    httpCredentials: {
      username: 'buffon',
      password: 'buffon@123',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // O Playwright vai subir nosso test-server automaticamente antes de rodar!
  webServer: {
    command: 'node test-server.js',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
  },
});
