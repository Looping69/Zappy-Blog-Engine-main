
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

