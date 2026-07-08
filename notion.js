export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB = process.env.NOTION_DB;
  if (!NOTION_TOKEN || !NOTION_DB) return res.status(500).json({ error: 'Notion no configurado' });
  try {
    const rec = req.body;
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB },
        properties: {
          'Nombre': { title: [{ text: { content: rec.empresa || 'Sin nombre' } }] },
          'Empresa': { rich_text: [{ text: { content: rec.empresa || '' } }] },
          'Industria': { select: { name: rec.industria || 'Otro' } },
          'Ciudad': { rich_text: [{ text: { content: rec.ciudad || '' } }] },
          'Empleados': { number: parseInt(rec.empleados) || 0 },
          'Ingresos USD': { number: parseInt(rec.ingresos) || 0 },
          'Margen %': { number: parseFloat(rec.margen) || 0 },
          'Churn %': { number: parseFloat(rec.churn) || 0 },
          'Crecimiento %': { number: parseFloat(rec.crecimiento) || 0 },
          'Dolores': { rich_text: [{ text: { content: rec.dolores || '' } }] },
          'Intentos': { rich_text: [{ text: { content: rec.intentos || '' } }] },
          'Estado': { select: { name: 'Nuevo' } },
          'Fecha': { date: { start: new Date().toISOString().split('T')[0] } }
        }
      })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
