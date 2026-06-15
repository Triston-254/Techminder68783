export const COUNTY_AREAS = {
  Nairobi: [
    'CBD',
    'Westlands',
    'Kilimani',
    'Karen',
    'Eastleigh',
    'Kasarani',
    'Embakasi',
    'Ruaraka',
    'Rongai',
    'Ruaka',
    'South B',
    'South C',
    'Parklands',
    'Ngong Road',
    'Gigiri',
    'Lavington',
    'Donholm',
    'Umoja',
    'Kahawa',
    'Other',
  ],
  Mombasa: [
    'Mombasa Island',
    'Nyali',
    'Bamburi',
    'Likoni',
    'Changamwe',
    'Kisauni',
    'Shanzu',
    'Mtwapa',
    'Other',
  ],
  Kisumu: [
    'Kisumu Central',
    'Milimani',
    'Nyalenda',
    'Manyatta',
    'Mamboleo',
    'Other',
  ],
  Nakuru: [
    'Nakuru Town',
    'Section 58',
    'Lanet',
    'Naivasha',
    'Gilgil',
    'Other',
  ],
  Kiambu: [
    'Thika',
    'Ruiru',
    'Kiambu Town',
    'Juja',
    'Limuru',
    'Kikuyu',
    'Githurai',
    'Other',
  ],
  Machakos: [
    'Machakos Town',
    'Athi River',
    'Syokimau',
    'Mlolongo',
    'Other',
  ],
  Kajiado: [
    'Kitengela',
    'Ngong',
    'Ongata Rongai',
    'Kajiado Town',
    'Other',
  ],
  'Uasin Gishu': [
    'Eldoret Town',
    'Langas',
    'Pioneer',
    'Kapsoya',
    'Other',
  ],
  Kilifi: [
    'Kilifi Town',
    'Malindi',
    'Watamu',
    'Other',
  ],
  Kwale: [
    'Diani',
    'Ukunda',
    'Msambweni',
    'Other',
  ],
  Nyeri: [
    'Nyeri Town',
    'Karatina',
    'Other',
  ],
  Meru: [
    'Meru Town',
    'Maua',
    'Other',
  ],
  Kakamega: [
    'Kakamega Town',
    'Mumias',
    'Other',
  ],
  Bungoma: [
    'Bungoma Town',
    'Webuye',
    'Other',
  ],
  Kisii: [
    'Kisii Town',
    'Other',
  ],
  Migori: [
    'Migori Town',
    'Rongo',
    'Other',
  ],
  'Homa Bay': [
    'Homa Bay Town',
    'Other',
  ],
  Siaya: [
    'Siaya Town',
    'Other',
  ],
  Busia: [
    'Busia Town',
    'Other',
  ],
  Vihiga: [
    'Mbale',
    'Other',
  ],
  Embu: [
    'Embu Town',
    'Other',
  ],
  Kirinyaga: [
    'Kerugoya',
    'Other',
  ],
  "Murang'a": [
    "Murang'a Town",
    'Other',
  ],
  Nyandarua: [
    'Ol Kalou',
    'Other',
  ],
  Nandi: [
    'Kapsabet',
    'Other',
  ],
  Kericho: [
    'Kericho Town',
    'Other',
  ],
  Bomet: [
    'Bomet Town',
    'Other',
  ],
  Narok: [
    'Narok Town',
    'Other',
  ],
  Laikipia: [
    'Nanyuki',
    'Nyahururu',
    'Other',
  ],
  Isiolo: [
    'Isiolo Town',
    'Other',
  ],
  Garissa: [
    'Garissa Town',
    'Other',
  ],
  Wajir: [
    'Wajir Town',
    'Other',
  ],
  Mandera: [
    'Mandera Town',
    'Other',
  ],
  Marsabit: [
    'Marsabit Town',
    'Other',
  ],
  Turkana: [
    'Lodwar',
    'Other',
  ],
  'West Pokot': [
    'Kapenguria',
    'Other',
  ],
  Samburu: [
    'Maralal',
    'Other',
  ],
  'Trans Nzoia': [
    'Kitale',
    'Other',
  ],
  'Elgeyo-Marakwet': [
    'Iten',
    'Other',
  ],
  Baringo: [
    'Kabarnet',
    'Other',
  ],
  'Taita-Taveta': [
    'Voi',
    'Wundanyi',
    'Other',
  ],
  'Tana River': [
    'Hola',
    'Other',
  ],
  Lamu: [
    'Lamu Town',
    'Other',
  ],
  Kitui: [
    'Kitui Town',
    'Other',
  ],
  Makueni: [
    'Wote',
    'Other',
  ],
  'Tharaka-Nithi': [
    'Chuka',
    'Other',
  ],
  Nyamira: [
    'Nyamira Town',
    'Other',
  ],
};

export function getAreasForCounty(county) {
  return COUNTY_AREAS[county] || ['Central', 'Other'];
}

export function formatJobLocation(county, area) {
  const trimmedCounty = (county || '').trim();
  const trimmedArea = (area || '').trim();
  if (!trimmedCounty) return '';
  if (!trimmedArea || trimmedArea === 'Other') return trimmedCounty;
  return `${trimmedCounty} – ${trimmedArea}`;
}

export function parseJobLocation(location) {
  const value = (location || '').trim();
  if (!value) return { county: '', area: '' };

  const dashIndex = value.indexOf(' – ');
  if (dashIndex === -1) {
    return { county: value, area: '' };
  }

  return {
    county: value.slice(0, dashIndex).trim(),
    area: value.slice(dashIndex + 3).trim(),
  };
}
