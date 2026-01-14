
// Integration services using environment variables directly

export const publishToSanity = async (title: string, content: string) => {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
  const token = import.meta.env.VITE_SANITY_TOKEN;

  if (!projectId || !token) {
    throw new Error('Sanity configuration missing. Please set VITE_SANITY_PROJECT_ID and VITE_SANITY_TOKEN in .env');
  }

  const mutations = [{
    create: {
      _type: 'post',
      title: title,
      body: content,
      publishedAt: new Date().toISOString()
    }
  }];

  const response = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ mutations })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.description || `Sanity Error: ${response.statusText}`);
  }
  return response.json();
};

export const publishToAirtable = async (title: string, content: string) => {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Content';

  if (!apiKey || !baseId) {
    throw new Error('Airtable configuration missing. Please set VITE_AIRTABLE_API_KEY and VITE_AIRTABLE_BASE_ID in .env');
  }

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      fields: {
        Title: title,
        Content: content,
        Status: 'Draft'
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Airtable Error: ${response.statusText}`);
  }
  return response.json();
};


export const publishToWordPress = async (title: string, content: string) => {
  const baseUrl = import.meta.env.VITE_WORDPRESS_URL;
  const username = import.meta.env.VITE_WORDPRESS_USERNAME;
  const appPassword = import.meta.env.VITE_WORDPRESS_APP_PASSWORD;

  if (!baseUrl || !username || !appPassword) {
    throw new Error('WordPress configuration missing. Please set VITE_WORDPRESS_URL, VITE_WORDPRESS_USERNAME, and VITE_WORDPRESS_APP_PASSWORD in .env');
  }

  const credentials = btoa(`${username}:${appPassword}`);
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`
    },
    body: JSON.stringify({
      title: title,
      content: content,
      status: 'draft'
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `WordPress Error: ${response.statusText}`);
  }
  return response.json();
};

export const publishToShopify = async (title: string, content: string) => {
  const shopName = import.meta.env.VITE_SHOPIFY_SHOP_NAME;
  const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

  if (!shopName || !accessToken) {
    throw new Error('Shopify configuration missing. Please set VITE_SHOPIFY_SHOP_NAME and VITE_SHOPIFY_ACCESS_TOKEN in .env');
  }

  const response = await fetch(`https://${shopName}.myshopify.com/admin/api/2023-10/articles.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({
      article: {
        title: title,
        body_html: content,
        author: 'Zappy Engine'
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.errors || `Shopify Error: ${response.statusText}`);
  }
  return response.json();
};

export const saveToNeonBackend = async (keyword: string, title: string, content: string, tokens: number) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const response = await fetch(`${backendUrl}/api/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ keyword, title, content, tokens })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `Backend Error: ${response.statusText}`);
  }
  return response.json();
};
