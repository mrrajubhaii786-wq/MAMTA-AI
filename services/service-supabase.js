/**
 * MAMTA AI V6 - Supabase Service
 * Centralized Supabase client and database operations
 * @version 6.0.0
 */
class SupabaseService {
  constructor() {
    this.url = 'https://djupszhqebpuohvzamcx.supabase.co';
    this.key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdXBzemhxZWJwdW9odnphbWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNjg2OCwiZXhwIjoyMDk4NTAyODY4fQ.VGyU6bARum6qIZ06oIqY5j7i5FoskyYH7LBUHNHeJHQ';
    this.headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    this.subscriptions = new Map();
  }

  async init() {
    console.log('🔌 Supabase Service initialized');
    return true;
  }

  // Generic REST API methods
  async select(table, options = {}) {
    const { columns = '*', filters = {}, limit = 100, order = 'created_at.desc' } = options;
    let url = `${this.url}/rest/v1/${table}?select=${columns}&order=${order}&limit=${limit}`;

    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (typeof val === 'string') {
        url += `&${key}=ilike.*${encodeURIComponent(val)}*`;
      } else if (val !== null && val !== undefined) {
        url += `&${key}=eq.${encodeURIComponent(val)}`;
      }
    });

    try {
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Select failed: ${res.status} ${await res.text()}`);
      return await res.json();
    } catch (e) {
      console.error('Supabase select error:', e);
      throw e;
    }
  }

  async insert(table, data) {
    const url = `${this.url}/rest/v1/${table}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Insert failed: ${res.status} ${await res.text()}`);
      return await res.json();
    } catch (e) {
      console.error('Supabase insert error:', e);
      throw e;
    }
  }

  async update(table, data, filters) {
    let url = `${this.url}/rest/v1/${table}`;
    Object.keys(filters).forEach((key, i) => {
      url += i === 0 ? '?' : '&';
      url += `${key}=eq.${encodeURIComponent(filters[key])}`;
    });

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
      return await res.json();
    } catch (e) {
      console.error('Supabase update error:', e);
      throw e;
    }
  }

  async delete(table, filters) {
    let url = `${this.url}/rest/v1/${table}`;
    Object.keys(filters).forEach((key, i) => {
      url += i === 0 ? '?' : '&';
      url += `${key}=eq.${encodeURIComponent(filters[key])}`;
    });

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.headers
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status} ${await res.text()}`);
      return true;
    } catch (e) {
      console.error('Supabase delete error:', e);
      throw e;
    }
  }

  async count(table, filters = {}) {
    let url = `${this.url}/rest/v1/${table}?select=count()`;
    Object.keys(filters).forEach(key => {
      url += `&${key}=eq.${encodeURIComponent(filters[key])}`;
    });

    try {
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Count failed: ${res.status}`);
      const data = await res.json();
      return data.length > 0 ? parseInt(data[0].count) : 0;
    } catch (e) {
      console.error('Supabase count error:', e);
      return 0;
    }
  }

  // Realtime subscription (using SSE fallback for GitHub Pages compatibility)
  subscribe(table, callback, filters = {}) {
    console.log(`📡 Subscribing to ${table} changes...`);
    // For GitHub Pages static hosting, we use polling fallback
    const interval = setInterval(async () => {
      try {
        const data = await this.select(table, { filters, limit: 50, order: 'created_at.desc' });
        callback(data);
      } catch (e) {
        console.error('Subscription poll error:', e);
      }
    }, 5000);

    this.subscriptions.set(table, interval);
    return () => {
      clearInterval(interval);
      this.subscriptions.delete(table);
    };
  }

  unsubscribe(table) {
    if (this.subscriptions.has(table)) {
      clearInterval(this.subscriptions.get(table));
      this.subscriptions.delete(table);
      console.log(`📡 Unsubscribed from ${table}`);
    }
  }

  async healthCheck() {
    try {
      const res = await fetch(`${this.url}/rest/v1/`, { headers: this.headers });
      return res.status === 200;
    } catch (e) {
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SupabaseService };
}
