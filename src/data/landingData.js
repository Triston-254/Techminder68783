export const categories = [
  { key: 'construction', en: 'Construction & Labor', sw: 'Ujenzi & Kazi', icon: '🏗️' },
  { key: 'hospitality', en: 'Hospitality', sw: 'Ukarimu', icon: '🍽️' },
  { key: 'domestic', en: 'Domestic Work', sw: 'Kazi za Nyumbani', icon: '🏠' },
  { key: 'delivery', en: 'Delivery & Logistics', sw: 'Usafirishaji & Usambazaji', icon: '📦' },
];

export const nearbyJobs = [
  { key: 'shortTerm', en: 'Daily Cleaner – Westlands', sw: 'Msafishaji wa Kila Siku – Westlands', location: 'Nairobi', pay: 'KES 1,200/day' },
  { key: 'security', en: 'Evening Security Guard', sw: 'Mlinzi wa Jioni', location: 'Kisumu', pay: 'KES 800/day' },
  { key: 'waitress', en: 'Part-Time Waitress', sw: 'Mhudumu wa Sehemu ya Muda', location: 'Mombasa', pay: 'KES 600/day' },
];

export const featuredJobs = [
  { key: 'driver', en: 'Motorbike Rider (CG)', sw: 'Dereva wa Pikipiki (CG)', label: 'Daily pay', labelSw: 'Malipo ya Kila Siku' },
  { key: 'cashier', en: 'Shop Cashier', sw: 'Mpiga Piga Kadi Duka', label: 'Verified employer', labelSw: 'Mwajiri Thibitisho' },
  { key: 'chef', en: 'Kitchen Assistant', sw: 'Msaidizi wa Jikoni', label: 'Immediate start', labelSw: 'Anza Mara Moja' },
];

export const testimonials = [
  { name: 'Amina', roleEn: 'Marketplace Worker', roleSw: 'Mfanyakazi Sokoni', quoteEn: 'I found a reliable part-time job in the neighbourhood within minutes.', quoteSw: 'Nilipata kazi ya muda karibu ndani ya dakika.', country: 'Nairobi' },
  { name: 'Peter', roleEn: 'Daily Wage Earner', roleSw: 'Mwenye Malipo ya Kila Siku', quoteEn: 'The location-based jobs helped me get work close to home.', quoteSw: 'Kazi zilizo karibu ziliweza kunisaidia kupata kazi karibu na nyumbani.', country: 'Mombasa' },
  { name: 'Triston', roleEn: 'Casual Worker', roleSw: 'Mfanyakazi wa Kawaida', quoteEn: 'I stopped chasing WhatsApp group posts. SmartJob sent me alerts, I applied to two roles in Kisii, and I was working by the end of the week.', quoteSw: 'Nilikuacha kufuatilia vikundi vya WhatsApp. SmartJob ilinitumia arifa, nikaomba kazi mbili Kisii, na nikaanza kufanya kazi mwishoni mwa wiki.', country: 'Kisii' },
];

export const stats = [
  { key: 'jobs', value: '12,000+', icon: '💼' },
  { key: 'employers', value: '2,400+', icon: '✅' },
  { key: 'counties', value: '47', icon: '📍' },
  { key: 'seekers', value: '85,000+', icon: '👥' },
];

export const translatorDictionary = {
  en2sw: {
    find: 'pata', jobs: 'kazi', near: 'karibu', you: 'yako', today: 'leo', hourly: 'kwa saa', 'part-time': 'sehemu ya muda', contract: 'kandarasi', work: 'kazi', employer: 'mwajiri', nearby: 'karibu', mobile: 'simu', simple: 'rahisi', translate: 'tafsiri', back: 'nyuma', verified: 'thibitishwa', local: 'mitaa', hire: 'ajiari', pay: 'malipo', training: 'mafunzo', profile: 'wasifu', search: 'tafuta', county: 'kaunti', task: 'tukio', connect: 'kuungana', market: 'soko', support: 'msaada', skills: 'ustadi', Kenya: 'Kenya', courier: 'makatibu', domestic: 'nyumbani', hospitality: 'ukarimu', construction: 'ujenzi',
  },
  sw2en: {
    pata: 'find', kazi: 'jobs', karibu: 'near', yako: 'your', leo: 'today', 'kwa saa': 'hourly', 'sehemu ya muda': 'part-time', kandarasi: 'contract', mwajiri: 'employer', simu: 'mobile', rahisi: 'simple', tafsiri: 'translate', nyuma: 'back', thibitishwa: 'verified', mitaa: 'local', ajiari: 'hire', malipo: 'pay', mafunzo: 'training', wasifu: 'profile', tazi: 'search', kaunti: 'county', tukio: 'task', kuungana: 'connect', soko: 'market', msaada: 'support', ustadi: 'skills', makatibu: 'couriers', nyumbani: 'domestic', ukarimu: 'hospitality', ujenzi: 'construction',
  },
};

export const splitWords = (text) => text.split(/(\s+|[.,!?]+|\n)/g);
