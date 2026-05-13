# Estrategista IA — Deploy no Vercel

## Passo a passo

### 1. Suba o projeto no GitHub
1. Vá em github.com → clique em **New repository**
2. Nome: `estrategista` → clique em **Create repository**
3. Na próxima tela, clique em **uploading an existing file**
4. Arraste TODOS os arquivos desta pasta (exceto `.env.local`) para o GitHub
5. Clique em **Commit changes**

### 2. Deploy no Vercel
1. Vá em vercel.com → clique em **Add New Project**
2. Clique em **Import** no repositório `estrategista`
3. Clique em **Deploy** (não mude nada)
4. Aguarde o deploy terminar (~2 minutos)

### 3. Adicionar a chave da API
1. No Vercel, vá em **Settings → Environment Variables**
2. Clique em **Add**
3. Name: `ANTHROPIC_API_KEY`
4. Value: sua chave (sk-ant-api03-...)
5. Clique em **Save**
6. Vá em **Deployments** → clique nos 3 pontinhos → **Redeploy**

### Pronto! 🎉
Sua URL será algo como: `estrategista.vercel.app`
