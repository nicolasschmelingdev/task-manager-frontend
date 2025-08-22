export const environment = {
  production: true,
  apiBaseUrl: '/api', // Em produção, use o mesmo caminho e faça o reverse proxy no gateway/ingress
  mockApi: false // Disable mock data in production
};
