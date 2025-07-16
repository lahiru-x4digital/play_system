import {
  parsePhoneNumber,
  parsePhoneNumberFromString,
  AsYouType,
} from "libphonenumber-js";

// Define country-specific phone number rules
const COUNTRY_PHONE_RULES = {
  ad: { countryCode: "376", requiredLength: 6 }, // Andorra
  ae: { countryCode: "971", requiredLength: 9 }, // UAE
  af: { countryCode: "93", requiredLength: 9 }, // Afghanistan
  ag: { countryCode: "1264", requiredLength: 7 }, // Antigua and Barbuda
  al: { countryCode: "355", requiredLength: 9 }, // Albania
  am: { countryCode: "374", requiredLength: 8 }, // Armenia
  ao: { countryCode: "244", requiredLength: 9 }, // Angola
  ar: { countryCode: "54", requiredLength: 10 }, // Argentina
  at: { countryCode: "43", requiredLength: 10 }, // Austria
  au: { countryCode: "61", requiredLength: 9 }, // Australia
  aw: { countryCode: "297", requiredLength: 7 }, // Aruba
  az: { countryCode: "994", requiredLength: 9 }, // Azerbaijan
  ba: { countryCode: "387", requiredLength: 8 }, // Bosnia and Herzegovina
  bb: { countryCode: "1246", requiredLength: 7 }, // Barbados
  bd: { countryCode: "880", requiredLength: 10 }, // Bangladesh
  be: { countryCode: "32", requiredLength: 9 }, // Belgium
  bf: { countryCode: "226", requiredLength: 8 }, // Burkina Faso
  bg: { countryCode: "359", requiredLength: 9 }, // Bulgaria
  bh: { countryCode: "973", requiredLength: 8 }, // Bahrain
  bi: { countryCode: "257", requiredLength: 8 }, // Burundi
  bj: { countryCode: "229", requiredLength: 8 }, // Benin
  bn: { countryCode: "673", requiredLength: 7 }, // Brunei
  bo: { countryCode: "591", requiredLength: 8 }, // Bolivia
  br: { countryCode: "55", requiredLength: 11 }, // Brazil
  bs: { countryCode: "1242", requiredLength: 7 }, // Bahamas
  bt: { countryCode: "975", requiredLength: 8 }, // Bhutan
  bw: { countryCode: "267", requiredLength: 8 }, // Botswana
  by: { countryCode: "375", requiredLength: 9 }, // Belarus
  bz: { countryCode: "501", requiredLength: 7 }, // Belize
  ca: { countryCode: "1", requiredLength: 10 }, // Canada
  cd: { countryCode: "243", requiredLength: 9 }, // Congo
  cf: { countryCode: "236", requiredLength: 8 }, // Central African Republic
  cg: { countryCode: "242", requiredLength: 9 }, // Congo, Republic of the
  ch: { countryCode: "41", requiredLength: 9 }, // Switzerland
  ci: { countryCode: "225", requiredLength: 8 }, // Côte d'Ivoire
  ck: { countryCode: "682", requiredLength: 5 }, // Cook Islands
  cl: { countryCode: "56", requiredLength: 9 }, // Chile
  cm: { countryCode: "237", requiredLength: 9 }, // Cameroon
  cn: { countryCode: "86", requiredLength: 11 }, // China
  co: { countryCode: "57", requiredLength: 10 }, // Colombia
  cr: { countryCode: "506", requiredLength: 8 }, // Costa Rica
  cu: { countryCode: "53", requiredLength: 8 }, // Cuba
  cv: { countryCode: "238", requiredLength: 7 }, // Cape Verde
  cw: { countryCode: "599", requiredLength: 7 }, // Curacao
  cy: { countryCode: "357", requiredLength: 8 }, // Cyprus
  cz: { countryCode: "420", requiredLength: 9 }, // Czech Republic
  de: { countryCode: "49", requiredLength: 11 }, // Germany
  dj: { countryCode: "253", requiredLength: 8 }, // Djibouti
  dk: { countryCode: "45", requiredLength: 8 }, // Denmark
  dm: { countryCode: "1767", requiredLength: 7 }, // Dominica
  dz: { countryCode: "213", requiredLength: 9 }, // Algeria
  ec: { countryCode: "593", requiredLength: 9 }, // Ecuador
  ee: { countryCode: "372", requiredLength: 8 }, // Estonia
  eg: { countryCode: "20", requiredLength: 10 }, // Egypt
  er: { countryCode: "291", requiredLength: 7 }, // Eritrea
  es: { countryCode: "34", requiredLength: 9 }, // Spain
  et: { countryCode: "251", requiredLength: 9 }, // Ethiopia
  fi: { countryCode: "358", requiredLength: 9 }, // Finland
  fj: { countryCode: "679", requiredLength: 7 }, // Fiji
  fm: { countryCode: "691", requiredLength: 7 }, // Micronesia
  fr: { countryCode: "33", requiredLength: 9 }, // France
  ga: { countryCode: "241", requiredLength: 7 }, // Gabon
  gb: { countryCode: "44", requiredLength: 10 }, // United Kingdom
  gd: { countryCode: "1473", requiredLength: 7 }, // Grenada
  ge: { countryCode: "995", requiredLength: 9 }, // Georgia
  gf: { countryCode: "594", requiredLength: 9 }, // French Guiana
  gh: { countryCode: "233", requiredLength: 9 }, // Ghana
  gm: { countryCode: "220", requiredLength: 7 }, // Gambia
  gn: { countryCode: "224", requiredLength: 9 }, // Guinea
  gp: { countryCode: "590", requiredLength: 9 }, // Guadeloupe
  gq: { countryCode: "240", requiredLength: 9 }, // Equatorial Guinea
  gr: { countryCode: "30", requiredLength: 10 }, // Greece
  gt: { countryCode: "502", requiredLength: 8 }, // Guatemala
  gu: { countryCode: "1671", requiredLength: 7 }, // Guam
  gw: { countryCode: "245", requiredLength: 7 }, // Guinea-Bissau
  gy: { countryCode: "592", requiredLength: 7 }, // Guyana
  hk: { countryCode: "852", requiredLength: 8 }, // Hong Kong
  hn: { countryCode: "504", requiredLength: 8 }, // Honduras
  hr: { countryCode: "385", requiredLength: 9 }, // Croatia
  ht: { countryCode: "509", requiredLength: 8 }, // Haiti
  hu: { countryCode: "36", requiredLength: 9 }, // Hungary
  id: { countryCode: "62", requiredLength: 10 }, // Indonesia
  ie: { countryCode: "353", requiredLength: 9 }, // Ireland
  il: { countryCode: "972", requiredLength: 9 }, // Israel
  in: { countryCode: "91", requiredLength: 10 }, // India
  io: { countryCode: "246", requiredLength: 7 }, // British Indian Ocean Territory
  iq: { countryCode: "964", requiredLength: 10 }, // Iraq
  ir: { countryCode: "98", requiredLength: 10 }, // Iran
  is: { countryCode: "354", requiredLength: 7 }, // Iceland
  it: { countryCode: "39", requiredLength: 10 }, // Italy
  jo: { countryCode: "962", requiredLength: 9 }, // Jordan
  jp: { countryCode: "81", requiredLength: 10 }, // Japan
  ke: { countryCode: "254", requiredLength: 9 }, // Kenya
  kg: { countryCode: "996", requiredLength: 9 }, // Kyrgyzstan
  kh: { countryCode: "855", requiredLength: 8 }, // Cambodia
  ki: { countryCode: "686", requiredLength: 5 }, // Kiribati
  km: { countryCode: "269", requiredLength: 7 }, // Comoros
  kn: { countryCode: "1869", requiredLength: 7 }, // Saint Kitts and Nevis
  kp: { countryCode: "850", requiredLength: 10 }, // North Korea
  kr: { countryCode: "82", requiredLength: 10 }, // South Korea
  kw: { countryCode: "965", requiredLength: 8 }, // Kuwait
  kz: { countryCode: "7", requiredLength: 10 }, // Kazakhstan
  la: { countryCode: "856", requiredLength: 8 }, // Laos
  lb: { countryCode: "961", requiredLength: 8 }, // Lebanon
  lc: { countryCode: "1758", requiredLength: 7 }, // Saint Lucia
  li: { countryCode: "423", requiredLength: 7 }, // Liechtenstein
  lk: { countryCode: "94", requiredLength: 9 }, // Sri Lanka
  lr: { countryCode: "231", requiredLength: 8 }, // Liberia
  ls: { countryCode: "266", requiredLength: 8 }, // Lesotho
  lt: { countryCode: "370", requiredLength: 8 }, // Lithuania
  lu: { countryCode: "352", requiredLength: 9 }, // Luxembourg
  lv: { countryCode: "371", requiredLength: 8 }, // Latvia
  ly: { countryCode: "218", requiredLength: 9 }, // Libya
  ma: { countryCode: "212", requiredLength: 9 }, // Morocco
  mc: { countryCode: "377", requiredLength: 8 }, // Monaco
  md: { countryCode: "373", requiredLength: 8 }, // Moldova
  me: { countryCode: "382", requiredLength: 8 }, // Montenegro
  mg: { countryCode: "261", requiredLength: 9 }, // Madagascar
  mh: { countryCode: "692", requiredLength: 7 }, // Marshall Islands
  mk: { countryCode: "389", requiredLength: 8 }, // North Macedonia
  ml: { countryCode: "223", requiredLength: 8 }, // Mali
  mm: { countryCode: "95", requiredLength: 8 }, // Myanmar
  mn: { countryCode: "976", requiredLength: 8 }, // Mongolia
  mo: { countryCode: "853", requiredLength: 8 }, // Macau
  mq: { countryCode: "596", requiredLength: 9 }, // Martinique
  mr: { countryCode: "222", requiredLength: 8 }, // Mauritania
  mt: { countryCode: "356", requiredLength: 8 }, // Malta
  mu: { countryCode: "230", requiredLength: 8 }, // Mauritius
  mv: { countryCode: "960", requiredLength: 7 }, // Maldives
  mw: { countryCode: "265", requiredLength: 9 }, // Malawi
  mx: { countryCode: "52", requiredLength: 10 }, // Mexico
  my: { countryCode: "60", requiredLength: 9 }, // Malaysia
  mz: { countryCode: "258", requiredLength: 9 }, // Mozambique
  na: { countryCode: "264", requiredLength: 8 }, // Namibia
  nc: { countryCode: "687", requiredLength: 6 }, // New Caledonia
  ne: { countryCode: "227", requiredLength: 8 }, // Niger
  ng: { countryCode: "234", requiredLength: 10 }, // Nigeria
  ni: { countryCode: "505", requiredLength: 8 }, // Nicaragua
  nl: { countryCode: "31", requiredLength: 9 }, // Netherlands
  no: { countryCode: "47", requiredLength: 8 }, // Norway
  np: { countryCode: "977", requiredLength: 10 }, // Nepal
  nr: { countryCode: "674", requiredLength: 7 }, // Nauru
  nu: { countryCode: "683", requiredLength: 4 }, // Niue
  nz: { countryCode: "64", requiredLength: 9 }, // New Zealand
  om: { countryCode: "968", requiredLength: 8 }, // Oman
  pa: { countryCode: "507", requiredLength: 8 }, // Panama
  pe: { countryCode: "51", requiredLength: 9 }, // Peru
  pf: { countryCode: "689", requiredLength: 6 }, // French Polynesia
  pg: { countryCode: "675", requiredLength: 8 }, // Papua New Guinea
  ph: { countryCode: "63", requiredLength: 10 }, // Philippines
  pk: { countryCode: "92", requiredLength: 10 }, // Pakistan
  pl: { countryCode: "48", requiredLength: 9 }, // Poland
  ps: { countryCode: "970", requiredLength: 9 }, // Palestinian Territory
  pt: { countryCode: "351", requiredLength: 9 }, // Portugal
  pw: { countryCode: "680", requiredLength: 7 }, // Palau
  py: { countryCode: "595", requiredLength: 9 }, // Paraguay
  qa: { countryCode: "974", requiredLength: 8 }, // Qatar
  re: { countryCode: "262", requiredLength: 9 }, // Reunion
  ro: { countryCode: "40", requiredLength: 9 }, // Romania
  rs: { countryCode: "381", requiredLength: 9 }, // Serbia
  ru: { countryCode: "7", requiredLength: 10 }, // Russia
  rw: { countryCode: "250", requiredLength: 9 }, // Rwanda
  sa: { countryCode: "966", requiredLength: 9 }, // Saudi Arabia
  sb: { countryCode: "677", requiredLength: 7 }, // Solomon Islands
  sc: { countryCode: "248", requiredLength: 7 }, // Seychelles
  sd: { countryCode: "249", requiredLength: 9 }, // Sudan
  se: { countryCode: "46", requiredLength: 9 }, // Sweden
  sg: { countryCode: "65", requiredLength: 8 }, // Singapore
  si: { countryCode: "386", requiredLength: 8 }, // Slovenia
  sk: { countryCode: "421", requiredLength: 9 }, // Slovakia
  sl: { countryCode: "232", requiredLength: 8 }, // Sierra Leone
  sm: { countryCode: "378", requiredLength: 8 }, // San Marino
  sn: { countryCode: "221", requiredLength: 9 }, // Senegal
  so: { countryCode: "252", requiredLength: 8 }, // Somalia
  sr: { countryCode: "597", requiredLength: 7 }, // Suriname
  st: { countryCode: "239", requiredLength: 7 }, // Sao Tome and Principe
  sv: { countryCode: "503", requiredLength: 8 }, // El Salvador
  sy: { countryCode: "963", requiredLength: 9 }, // Syria
  sz: { countryCode: "268", requiredLength: 8 }, // Eswatini
  td: { countryCode: "235", requiredLength: 8 }, // Chad
  tg: { countryCode: "228", requiredLength: 8 }, // Togo
  th: { countryCode: "66", requiredLength: 9 }, // Thailand
  tj: { countryCode: "992", requiredLength: 9 }, // Tajikistan
  tk: { countryCode: "690", requiredLength: 4 }, // Tokelau
  tl: { countryCode: "670", requiredLength: 7 }, // Timor-Leste
  tm: { countryCode: "993", requiredLength: 8 }, // Turkmenistan
  tn: { countryCode: "216", requiredLength: 8 }, // Tunisia
  to: { countryCode: "676", requiredLength: 5 }, // Tonga
  tr: { countryCode: "90", requiredLength: 10 }, // Turkey
  tt: { countryCode: "1868", requiredLength: 7 }, // Trinidad and Tobago
  tv: { countryCode: "688", requiredLength: 5 }, // Tuvalu
  tw: { countryCode: "886", requiredLength: 9 }, // Taiwan
  tz: { countryCode: "255", requiredLength: 9 }, // Tanzania
  ua: { countryCode: "380", requiredLength: 9 }, // Ukraine
  ug: { countryCode: "256", requiredLength: 9 }, // Uganda
  us: { countryCode: "1", requiredLength: 10 }, // USA
  uy: { countryCode: "598", requiredLength: 8 }, // Uruguay
  uz: { countryCode: "998", requiredLength: 9 }, // Uzbekistan
  vc: { countryCode: "1784", requiredLength: 7 }, // Saint Vincent and the Grenadines
  ve: { countryCode: "58", requiredLength: 10 }, // Venezuela
  vn: { countryCode: "84", requiredLength: 9 }, // Vietnam
  vu: { countryCode: "678", requiredLength: 7 }, // Vanuatu
  wf: { countryCode: "681", requiredLength: 6 }, // Wallis and Futuna
  ws: { countryCode: "685", requiredLength: 7 }, // Samoa
  xk: { countryCode: "383", requiredLength: 8 }, // Kosovo
  ye: { countryCode: "967", requiredLength: 9 }, // Yemen
  za: { countryCode: "27", requiredLength: 9 }, // South Africa
  zm: { countryCode: "260", requiredLength: 9 }, // Zambia
  zw: { countryCode: "263", requiredLength: 9 }, // Zimbabwe
};

// Map country codes to ISO 2-letter codes
const COUNTRY_CODE_TO_ISO = {
  1: "us", // USA/Canada (using US as default)
  1: "ca", // Canada
  20: "eg", // Egypt
  213: "dz", // Algeria
  216: "tn", // Tunisia
  218: "ly", // Libya
  220: "gn", // Gambia
  221: "sn", // Senegal
  222: "mr", // Mauritania
  223: "ml", // Mali
  224: "gw", // Guinea
  225: "ci", // Côte d'Ivoire
  226: "bf", // Burkina Faso
  227: "ne", // Niger
  228: "tg", // Togo
  229: "bj", // Benin
  230: "mu", // Mauritius
  231: "lr", // Liberia
  232: "sl", // Sierra Leone
  233: "gh", // Ghana
  234: "ng", // Nigeria
  235: "td", // Chad
  236: "cf", // Central African Republic
  237: "cm", // Cameroon
  238: "cv", // Cape Verde
  239: "st", // Sao Tome and Principe
  242: "cg", // Congo, Republic of the
  243: "cd", // Congo
  244: "ao", // Angola
  246: "io", // British Indian Ocean Territory
  248: "sc", // Seychelles
  249: "sd", // Sudan
  250: "rw", // Rwanda
  251: "et", // Ethiopia
  252: "so", // Somalia
  253: "dj", // Djibouti
  254: "ke", // Kenya
  255: "tz", // Tanzania
  256: "ug", // Uganda
  257: "bi", // Burundi
  258: "mz", // Mozambique
  260: "zm", // Zambia
  261: "mg", // Madagascar
  262: "re", // Reunion
  263: "zw", // Zimbabwe
  264: "na", // Namibia
  265: "mw", // Malawi
  266: "ls", // Lesotho
  267: "bw", // Botswana
  268: "sz", // Eswatini
  269: "km", // Comoros
  27: "za", // South Africa
  297: "aw", // Aruba
  30: "gr", // Greece
  31: "nl", // Netherlands
  32: "be", // Belgium
  33: "fr", // France
  34: "es", // Spain
  351: "pt", // Portugal
  352: "lu", // Luxembourg
  353: "ie", // Ireland
  354: "is", // Iceland
  355: "al", // Albania
  356: "mt", // Malta
  357: "cy", // Cyprus
  358: "fi", // Finland
  359: "bg", // Bulgaria
  36: "hu", // Hungary
  370: "lt", // Lithuania
  371: "lv", // Latvia
  372: "ee", // Estonia
  373: "md", // Moldova
  374: "am", // Armenia
  375: "by", // Belarus
  376: "ad", // Andorra
  377: "mc", // Monaco
  378: "sm", // San Marino
  380: "ua", // Ukraine
  381: "rs", // Serbia
  382: "me", // Montenegro
  383: "xk", // Kosovo
  385: "hr", // Croatia
  386: "si", // Slovenia
  387: "ba", // Bosnia and Herzegovina
  389: "mk", // North Macedonia
  39: "it", // Italy
  40: "ro", // Romania
  41: "ch", // Switzerland
  420: "cz", // Czech Republic
  421: "sk", // Slovakia
  423: "li", // Liechtenstein
  43: "at", // Austria
  44: "gb", // United Kingdom
  45: "dk", // Denmark
  46: "se", // Sweden
  47: "no", // Norway
  48: "pl", // Poland
  49: "de", // Germany
  501: "bz", // Belize
  502: "gt", // Guatemala
  503: "sv", // El Salvador
  504: "hn", // Honduras
  505: "ni", // Nicaragua
  506: "cr", // Costa Rica
  507: "pa", // Panama
  509: "ht", // Haiti
  51: "pe", // Peru
  52: "mx", // Mexico
  53: "cu", // Cuba
  54: "ar", // Argentina
  55: "br", // Brazil
  56: "cl", // Chile
  57: "co", // Colombia
  58: "ve", // Venezuela
  590: "gp", // Guadeloupe
  591: "bo", // Bolivia
  592: "gy", // Guyana
  593: "ec", // Ecuador
  594: "gf", // French Guiana
  595: "py", // Paraguay
  596: "mq", // Martinique
  597: "sr", // Suriname
  598: "uy", // Uruguay
  599: "cw", // Curacao
  60: "my", // Malaysia
  61: "au", // Australia
  62: "id", // Indonesia
  63: "ph", // Philippines
  64: "nz", // New Zealand
  65: "sg", // Singapore
  66: "th", // Thailand
  670: "tl", // Timor-Leste
  673: "bn", // Brunei
  674: "nr", // Nauru
  675: "pg", // Papua New Guinea
  676: "to", // Tonga
  677: "sb", // Solomon Islands
  678: "vu", // Vanuatu
  679: "fj", // Fiji
  680: "pw", // Palau
  681: "wf", // Wallis and Futuna
  682: "ck", // Cook Islands
  683: "nu", // Niue
  685: "ws", // Samoa
  686: "ki", // Kiribati
  687: "nc", // New Caledonia
  688: "tv", // Tuvalu
  689: "pf", // French Polynesia
  690: "tk", // Tokelau
  691: "fm", // Micronesia
  692: "mh", // Marshall Islands
  7: "ru", // Russia
  81: "jp", // Japan
  82: "kr", // South Korea
  84: "vn", // Vietnam
  850: "kp", // North Korea
  852: "hk", // Hong Kong
  853: "mo", // Macau
  855: "kh", // Cambodia
  856: "la", // Laos
  86: "cn", // China
  880: "bd", // Bangladesh
  886: "tw", // Taiwan
  91: "in", // India
  92: "pk", // Pakistan
  93: "af", // Afghanistan
  94: "lk", // Sri Lanka
  95: "mm", // Myanmar
  960: "mv", // Maldives
  961: "lb", // Lebanon
  962: "jo", // Jordan
  963: "sy", // Syria
  964: "iq", // Iraq
  965: "kw", // Kuwait
  966: "sa", // Saudi Arabia
  967: "ye", // Yemen
  968: "om", // Oman
  970: "ps", // Palestinian Territory
  971: "ae", // UAE
  972: "il", // Israel
  973: "bh", // Bahrain
  974: "qa", // Qatar
  975: "bt", // Bhutan
  976: "mn", // Mongolia
  977: "np", // Nepal
  98: "ir", // Iran
  992: "tj", // Tajikistan
  993: "tm", // Turkmenistan
  994: "az", // Azerbaijan
  995: "ge", // Georgia
  996: "kg", // Kyrgyzstan
  998: "uz", // Uzbekistan
  1242: "bs", // Bahamas
  1246: "bb", // Barbados
  1264: "ag", // Antigua and Barbuda
  1473: "gd", // Grenada
  1671: "gu", // Guam
  1758: "lc", // Saint Lucia
  1767: "dm", // Dominica
  1784: "vc", // Saint Vincent and the Grenadines
  1868: "tt", // Trinidad and Tobago
  1869: "kn", // Saint Kitts and Nevis
};

// Special handling for North American Numbering Plan (NANP) countries that share +1
const NANP_COUNTRIES = {
  us: { requiredLength: 10 },
  ca: { requiredLength: 10 },
  // Add other NANP countries as needed
};

/**
 * Convert a country code to ISO 2-letter code
 * @param {string} countryCode - The numeric country code
 * @returns {string} ISO 2-letter country code
 */
export function getISOCountryCode(countryCode) {
  return COUNTRY_CODE_TO_ISO[countryCode]; // Default to UAE if unknown
}

// /**
//  * Gets the required length for a specific country code
//  * @param {string} countryCode - The ISO 2-letter country code
//  * @returns {{ countryCode: string, requiredLength: number } | undefined}
//  */
// function getCountryRules(countryCode) {
//   return COUNTRY_PHONE_RULES[countryCode];
// }

/**
 * Extract country code from full phone number
 * @param {string} phoneNumber - The full phone number
 * @returns {string} The country code
 */
export function extractCountryCode(phoneNumber) {
  if (!phoneNumber) return ''; // Default to UAE if no number provided
  
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, "");

  // Try to match known country codes (starting with longest ones)
  const countryCodes = Object.keys(COUNTRY_CODE_TO_ISO).sort(
    (a, b) => b.length - a.length
  );
  for (const code of countryCodes) {
    if (digits.startsWith(code)) {
      return code;
    }
  }
  
  return ''; // Default to UAE
}

/**
 * Gets the required length for a specific country code
 * @param {string} countryCode - The ISO 2-letter country code
 * @returns {{ countryCode: string, requiredLength: number } | undefined}
 */
function getCountryRules(countryCode) {
  console.log("Getting rules for country code:", countryCode);
  return COUNTRY_PHONE_RULES[countryCode];
}

/**
 * Checks if the phone number has the correct number of digits for the country
 * @param {string} phoneNumber - The phone number to check
 * @param {string} countryCode - The ISO 2-letter country code
 * @returns {{ isValid: boolean, error?: string, digitsRemaining?: number }}
 */
function validateDigitLength(phoneNumber, countryCode) {
  console.log(
    "Validating phone number:",
    phoneNumber,
    "for country:",
    countryCode
  );

  // Clean the phone number first (remove all non-digits)
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  console.log("Cleaned number:", cleanNumber);

  // Get the rules for the provided country code
  const rules = getCountryRules(countryCode);
  console.log("Country rules:", rules);

  if (!rules) {
    console.log("No rules found for country code, skipping length validation");
    return { isValid: true }; // Skip length validation for unsupported countries
  }

  // Extract the country code from the beginning of the number if it exists
  let numberWithoutCountry = cleanNumber;
  if (cleanNumber.startsWith(rules.countryCode)) {
    console.log("Removing country code from number");
    numberWithoutCountry = cleanNumber.substring(rules.countryCode.length);
  }

  console.log("Number without country code:", numberWithoutCountry);

  const currentLength = numberWithoutCountry.length;
  const remainingDigits = rules.requiredLength - currentLength;

  console.log(
    "Current length:",
    currentLength,
    "Required:",
    rules.requiredLength
  );

  if (currentLength > rules.requiredLength) {
    const error = `Phone number is too long. Maximum ${rules.requiredLength} digits allowed after country code +${rules.countryCode}`;
    console.log("Validation failed:", error);
    return {
      isValid: false,
      error,
      digitsRemaining: 0,
    };
  }

  if (currentLength < rules.requiredLength) {
    const error = `Phone number is too short. ${remainingDigits} more digit${
      remainingDigits > 1 ? "s" : ""
    } required after country code +${rules.countryCode}`;
    console.log("Validation failed:", error);
    return {
      isValid: false,
      error,
      digitsRemaining: remainingDigits,
    };
  }

  return { isValid: true, digitsRemaining: 0 };
}

/**
 * Validates a phone number against country-specific rules
 * @param {string} phoneNumber - The phone number to validate
 * @param {string} countryCode - The ISO 2-letter country code (e.g., 'US', 'AE')
 * @returns {{ isValid: boolean, error?: string, formattedNumber?: string }} Validation result
 */
export function validatePhoneNumber(phoneNumber, countryCode) {
  if (!phoneNumber) {
    return {
      isValid: false,
      error: "Phone number is required",
    };
  }

  // Clean the phone number - remove all non-digit characters
  let cleanedNumber = phoneNumber.replace(/\D/g, "");

  // If no country code is provided, use a default
  if (!countryCode) {
    countryCode = ''; // Default to UAE if no country code provided
  }

  // Get the country rules
  const countryRules = COUNTRY_PHONE_RULES[countryCode.toLowerCase()];

  if (!countryRules) {
    return {
      isValid: false,
      error: `Phone number validation not supported for country: ${countryCode}`,
    };
  }

  // Remove country code if present
  let numberWithoutCountryCode = cleanedNumber;
  if (cleanedNumber.startsWith(countryRules.countryCode)) {
    numberWithoutCountryCode = cleanedNumber.substring(
      countryRules.countryCode.length
    );
  }
  // Remove leading zero if present
  if (numberWithoutCountryCode.startsWith("0")) {
    numberWithoutCountryCode = numberWithoutCountryCode.substring(1);
  }

  // Check the length matches the required length for the country
  if (numberWithoutCountryCode.length !== countryRules.requiredLength) {
    return {
      isValid: false,
      error: `Phone number for ${countryCode.toUpperCase()} must be ${
        countryRules.requiredLength
      } digits`,
    };
  }

  // Check if the number contains only digits
  if (!/^\d+$/.test(numberWithoutCountryCode)) {
    return {
      isValid: false,
      error: "Phone number can only contain digits",
    };
  }

  // Format the number with the country code
  const formattedNumber = `+${countryRules.countryCode}${numberWithoutCountryCode}`;

  return {
    isValid: true,
    formattedNumber,
  };
}

/**
 * Formats a phone number as you type and enforces country-specific length limits
 * @param {string} phoneNumber - The phone number being typed
 * @param {string} countryCode - The ISO 2-letter country code
 * @returns {{ formattedValue: string, isValid: boolean, error?: string, digitsRemaining: number }} Formatted result
 */
export function formatPhoneNumberAsYouType(phoneNumber, countryCode) {
  if (!phoneNumber) {
    return {
      formattedValue: "",
      isValid: false,
      digitsRemaining: 0,
    };
  }

  // Clean the input - remove all non-digit characters
  let cleanedNumber = phoneNumber.replace(/\D/g, "");

  // If no country code is provided, default to UAE
  const country = countryCode?.toLowerCase();
  const countryRules = COUNTRY_PHONE_RULES[country];

  if (!countryRules) {
    return {
      formattedValue: cleanedNumber,
      isValid: false,
      error: "Invalid country code",
      digitsRemaining: 0,
    };
  }

  let numberWithoutCountryCode = cleanedNumber;
  // Remove country code if present
  if (cleanedNumber.startsWith(countryRules.countryCode)) {
    numberWithoutCountryCode = cleanedNumber.substring(
      countryRules.countryCode.length
    );
  }
  // Remove leading zero if present
  if (numberWithoutCountryCode.startsWith("0")) {
    numberWithoutCountryCode = numberWithoutCountryCode.substring(1);
  }

  // Check if the number is too long
  const isExceedingMax =
    numberWithoutCountryCode.length > countryRules.requiredLength;
  const isValid =
    numberWithoutCountryCode.length === countryRules.requiredLength;
  const digitsRemaining = Math.max(
    0,
    countryRules.requiredLength - numberWithoutCountryCode.length
  );

  // Format the number with country code
  let formattedValue = `+${countryRules.countryCode}${numberWithoutCountryCode}`;

  // Add formatting for better readability
  if (numberWithoutCountryCode.length > 0) {
    formattedValue = `+${
      countryRules.countryCode
    } ${numberWithoutCountryCode.replace(/(\d{3})(?=\d)/g, "$1 ")}`.trim();
  }

  if (isExceedingMax) {
    return {
      formattedValue: `+${
        countryRules.countryCode
      } ${numberWithoutCountryCode.substring(
        0,
        countryRules.requiredLength
      )} ${numberWithoutCountryCode.substring(
        countryRules.requiredLength
      )}`.trim(),
      isValid: false,
      error: `Phone number is too long. Please remove ${
        numberWithoutCountryCode.length - countryRules.requiredLength
      } digit(s)`,
      digitsRemaining: 0,
      isExceedingMax: true,
    };
  }

  return {
    formattedValue,
    isValid,
    digitsRemaining,
    error: isValid
      ? undefined
      : `Enter ${digitsRemaining} more digit${
          digitsRemaining !== 1 ? "s" : ""
        }`,
  };
}

export function hasMobileNumberRequiredLength(iso, input = "") {
  if (!iso || !input) return false;

  const rules = COUNTRY_PHONE_RULES[iso.toLowerCase()];
  if (!rules) return false; // unsupported country

  // keep digits only
  const digits = input.replace(/\D/g, "");

  // strip leading country code if present
  let national = digits.startsWith(rules.countryCode)
    ? digits.slice(rules.countryCode.length)
    : digits;

  // strip a single leading zero often shown in national format
  if (national.startsWith("0")) national = national.slice(1);

  return national.length === rules.requiredLength;
}
