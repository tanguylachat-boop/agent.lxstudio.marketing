import axios from 'axios';

export interface TrendData {
  topics: string[];
  keywords: string[];
  niche: string;
  persona: string;
}

export async function fetchTrends(): Promise<TrendData> {
  const apiUrl = process.env.TRENDS_API_URL;
  const apiKey = process.env.TRENDS_API_KEY;

  // Fallback to default trends if API not configured
  if (!apiUrl) {
    console.warn('⚠️  TRENDS_API_URL not set, using default trends');
    return {
      topics: [
        'IA et automatisation pour PME',
        'SEO local en 2025',
        'Agents IA conversationnels',
        'Optimisation Google Business Profile'
      ],
      keywords: ['AI', 'automation', 'SEO', 'growth', 'leads'],
      niche: 'Automatisation IA Business',
      persona: 'Dirigeant PME (20-100 employés, secteur services)'
    };
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
      timeout: 15000
    });

    return {
      topics: response.data.topics || [],
      keywords: response.data.keywords || [],
      niche: response.data.niche || 'Automatisation IA Business',
      persona: response.data.persona || 'Dirigeant PME'
    };
  } catch (error) {
    console.error('❌ Error fetching trends:', error);
    // Return fallback data
    return {
      topics: ['IA et automatisation', 'Croissance digitale'],
      keywords: ['AI', 'automation', 'business'],
      niche: 'Automatisation IA Business',
      persona: 'Dirigeant PME'
    };
  }
}
