const url = 'https://lmkutuybfpglfkfxiwns.supabase.co/rest/v1/announcements?title=eq.%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A8%D9%83%20%D9%81%D9%8A%20%D8%B5%D9%8A%D8%A7%D9%86%D8%A9%20%D8%B3%D9%8A%D8%A7%D8%B1%D8%AA%D9%8A';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxta3V0dXliZnBnbGZrZnhpd25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTQ5MTEsImV4cCI6MjA4ODkzMDkxMX0.aiVnyjWij99Jx_OZ9hlQ2ZOBlcb47gugoWh-coPAS-U';

fetch(url, {
  method: 'DELETE',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}).then(res => {
  console.log('Status:', res.status);
}).catch(console.error);
