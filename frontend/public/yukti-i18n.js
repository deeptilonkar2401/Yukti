(function () {
  const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'sat', name: 'Santhali', nativeName: 'संथाली (ᱥᱟᱱᱛᱟᱲᱤ)', flag: '🌾' },
    { code: 'mun', name: 'Mundari', nativeName: 'मुंडारी (ᱢᱩᱱᱰᱟᱨᱤ)', flag: '🌲' },
    { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख (ᱠᱩᱲᱩᱠᱷ)', flag: '🌿' },
  ];

  const DICTIONARY = {
    hi: {
      "Dashboard": "डैशबोर्ड",
      "Overview": "अवलोकन",
      "Reports": "रिपोर्ट्स",
      "Projects": "परियोजनाएं",
      "Analytics": "विश्लेषण",
      "Logout": "लॉगआउट",
      "Log out": "लॉगआउट",
      "Sign Out": "साइन आउट",
      "Welcome": "स्वागत है",
      "Total Reports": "कुल रिपोर्टें",
      "Pending Verification": "सत्यापन लंबित",
      "Assigned Projects": "आवंटित परियोजनाएं",
      "Completed": "पूर्ण",
      "High Priority": "उच्च प्राथमिकता",
      "District Admin Portal": "जिला प्रशासन पोर्टल",
      "University Portal": "विश्वविद्यालय पोर्टल",
      "Industry CSR Portal": "उद्योग सीएसआर पोर्टल",
      "Search": "खोजें",
      "Filter": "फ़िल्टर",
      "Action": "कार्रवाई",
      "Status": "स्थिति",
      "Details": "विवरण",
      "Submit": "जमा करें",
      "Close": "बंद करें",
      "Accept": "स्वीकार करें",
      "Reject": "अस्वीकार करें",
      "Assign": "सौंपें",
      "Merge": "विलय करें"
    },
    sat: {
      "Dashboard": "ᱰᱮᱥᱵᱚᱨᱰ (डैशबोर्ड)",
      "Overview": "ᱧᱮᱞ (अवलोकन)",
      "Reports": "ᱨᱤᱯᱚᱨᱴ (रिपोर्ट्स)",
      "Projects": "ᱠᱟᱹᱢᱤ (परियोजनाएं)",
      "Analytics": "ᱵᱤᱪᱟᱹᱨ (विश्लेषण)",
      "Logout": "ᱞᱚᱜᱽ ᱟᱣᱩᱴ (लॉगआउट)",
      "Log out": "ᱞᱚᱜᱽ ᱟᱣᱩᱴ",
      "Sign Out": "ᱞᱚᱜᱽ ᱟᱣᱩᱴ",
      "Welcome": "ᱡᱚᱦᱟᱨ (स्वागत है)",
      "Total Reports": "ᱡᱚᱛᱚ ᱨᱤᱯᱚᱨᱴ (कुल रिपोर्टें)",
      "Pending Verification": "ᱵᱤᱪᱟᱹᱨ ᱵᱟᱹᱱᱩᱜᱼᱟ (सत्यापन लंबित)",
      "Assigned Projects": "ᱪᱟᱞ ᱟᱠᱟᱱ ᱠᱟᱹᱢᱤ (आवंटित परियोजनाएं)",
      "Completed": "ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ (पूर्ण)",
      "High Priority": "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ (उच्च प्राथमिकता)",
      "District Admin Portal": "ᱡᱤᱞᱟᱹ ᱚᱯᱷᱤᱥᱚᱨ ᱯᱚᱨᱴᱟᱞ",
      "University Portal": "ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱯᱚᱨᱴᱟᱞ",
      "Industry CSR Portal": "ᱠᱟᱹᱨᱠᱷᱟᱱᱟ CSR ᱯᱚᱨᱴᱟᱞ",
      "Search": "ᱥᱮᱸᱫᱽᱨᱟ (खोजें)",
      "Filter": "ᱵᱟᱪᱷᱟᱣ (फ़िल्टर)",
      "Action": "ᱠᱟᱹᱢᱤ (कार्रवाई)",
      "Status": "ᱦᱟᱞᱚᱛ (स्थिति)",
      "Details": "ᱴᱤᱠᱟᱹᱱᱟ (विवरण)",
      "Submit": "ᱚᱞ (जमा करें)",
      "Close": "ᱵᱚᱱᱫᱚ (बंद करें)",
      "Accept": "ᱦᱮᱸ (स्वीकार करें)",
      "Reject": "ᱵᱟᱝ (अस्वीकार करें)",
      "Assign": "ᱪᱟᱞ (सौंपें)",
      "Merge": "ᱡᱚᱲᱟᱣ (विलय करें)"
    },
    mun: {
      "Dashboard": "ᱰᱮᱥᱵᱚᱨᱰ (डैशबोर्ड)",
      "Overview": "ᱧᱮᱞ (अवलोकन)",
      "Reports": "ᱨᱤᱯᱚᱨᱴ (रिपोर्ट्स)",
      "Projects": "ᱠᱟᱹᱢᱤ (परियोजनाएं)",
      "Analytics": "ᱵᱤᱪᱟᱹᱨ (विश्लेषण)",
      "Logout": "ᱞᱚᱜᱽ ᱟᱣᱩᱴ (लॉगआउट)",
      "Log out": "ᱞᱚᱜᱽ ᱟᱣᱩᱴ",
      "Sign Out": "ᱞᱚᱜᱽ ᱟᱣᱩᱴ",
      "Welcome": "ᱡᱚᱦᱟᱨ (स्वागत है)",
      "Total Reports": "ᱡᱚᱛᱚ ᱨᱤᱯᱚᱨᱴ (कुल रिपोर्टें)",
      "Pending Verification": "ᱡᱟᱸᱪ ᱵᱟᱹᱱᱩᱜᱼᱟ (सत्यापन लंबित)",
      "Assigned Projects": "ᱪᱟᱞ ᱟᱠᱟᱱ ᱠᱟᱹᱢᱤ (आवंटित परियोजनाएं)",
      "Completed": "ᱪᱟᱵᱟ ᱮᱱᱟ (पूर्ण)",
      "High Priority": "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ (उच्च प्राथमिकता)",
      "District Admin Portal": "ᱡᱤᱞᱟᱹ ᱚᱯᱷᱤᱥᱚᱨ ᱯᱚᱨᱴᱟᱞ",
      "University Portal": "ᱠᱚᱞᱮᱡᱽ ᱯᱚᱨᱴᱟᱞ",
      "Industry CSR Portal": "ᱠᱟᱹᱨᱠᱷᱟᱱᱟ CSR ᱯᱚᱨᱴᱟᱞ",
      "Search": "ᱥᱮᱸᱫᱽᱨᱟ (खोजें)",
      "Filter": "ᱵᱟᱪᱷᱟᱣ (फ़िल्टर)",
      "Action": "ᱠᱟᱹᱢᱤ (कार्रवाई)",
      "Status": "ᱦᱟᱞᱚᱛ (स्थिति)",
      "Details": "ᱴᱤᱠᱟᱹᱱᱟ (विवरण)",
      "Submit": "ᱚᱞ (जमा करें)",
      "Close": "ᱵᱚᱱᱫᱚ (बंद करें)",
      "Accept": "ᱦᱮᱸ (स्वीकार करें)",
      "Reject": "ᱵᱟᱝ (अस्वीकार करें)",
      "Assign": "ᱪᱟᱞ (सौंपें)",
      "Merge": "ᱡᱚᱲᱟᱣ (विलय करें)"
    },
    kru: {
      "Dashboard": "डैशबोर्ड (Dashboard)",
      "Overview": "इरा (अवलोकन)",
      "Reports": "रिपोर्ट्स",
      "Projects": "काम (परियोजनाएं)",
      "Analytics": "बिचार (विश्लेषण)",
      "Logout": "लॉगआउट (Logout)",
      "Log out": "लॉगआउट",
      "Sign Out": "साइन आउट",
      "Welcome": "जोहार (स्वागत है)",
      "Total Reports": "हुरमी रिपोर्ट",
      "Pending Verification": "जांच मल्ला",
      "Assigned Projects": "चीका काम",
      "Completed": "मंजा (पूर्ण)",
      "High Priority": "जरूरी काम",
      "District Admin Portal": "जिला अधिकारी पोर्टल",
      "University Portal": "कॉलेज पोर्टल",
      "Industry CSR Portal": "कंपनी CSR पोर्टल",
      "Search": "बेड़ा (खोजें)",
      "Filter": "चुना (फ़िल्टर)",
      "Action": "काम (कार्रवाई)",
      "Status": "हालत (स्थिति)",
      "Details": "विस्तार (विवरण)",
      "Submit": "चीइ (जमा करें)",
      "Close": "मुइ (बंद करें)",
      "Accept": "हओ (स्वीकार करें)",
      "Reject": "मल्ला (अस्वीकार करें)",
      "Assign": "चीइ (सौंपें)",
      "Merge": "ओंद्द संधे कमइ (विलय करें)"
    }
  };

  function getCurrentLang() {
    return sessionStorage.getItem('yukti_language') || localStorage.getItem('yukti_language') || 'en';
  }

  function setLanguage(code) {
    sessionStorage.setItem('yukti_language', code);
    localStorage.setItem('yukti_language', code);
    translateDocument(code);
    renderSelector();
  }

  // Translate document text nodes
  function translateDocument(lang) {
    if (lang === 'en' || !DICTIONARY[lang]) return;
    const dict = DICTIONARY[lang];

    function walkNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue.trim();
        if (text && dict[text]) {
          node.nodeValue = node.nodeValue.replace(text, dict[text]);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
        node.childNodes.forEach(walkNode);
      }
    }

    walkNode(document.body);
  }

  function renderSelector() {
    let container = document.getElementById('yukti-static-lang-selector');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yukti-static-lang-selector';
      container.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:999999; font-family:sans-serif;';
      document.body.appendChild(container);
    }

    const current = getCurrentLang();
    const activeObj = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

    container.innerHTML = `
      <div style="position:relative; display:inline-block;">
        <button id="yukti-lang-btn" style="background:#312e81; color:#ffffff; border:1px solid rgba(255,255,255,0.2); padding:8px 14px; border-radius:30px; font-weight:bold; font-size:13px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.25); flex-direction:row; align-items:center; gap:6px; display:flex;">
          <span>🌐 ${activeObj.nativeName}</span>
          <span style="font-size:10px; opacity:0.8;">▼</span>
        </button>
        <div id="yukti-lang-menu" style="display:none; position:absolute; bottom:42px; right:0; width:210px; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 10px 25px rgba(0,0,0,0.2); overflow:hidden; z-index:1000000;">
          <div style="padding:8px 12px; background:#f1f5f9; font-size:11px; font-weight:bold; color:#475569; border-bottom:1px solid #e2e8f0; text-transform:uppercase;">
            Select Language / भाषा चुनें
          </div>
          ${LANGUAGES.map(l => `
            <div data-lang="${l.code}" class="yukti-lang-opt" style="padding:10px 14px; font-size:13px; font-weight:${l.code === current ? 'bold' : 'normal'}; background:${l.code === current ? '#e0e7ff' : '#ffffff'}; color:${l.code === current ? '#312e81' : '#1e293b'}; cursor:pointer; border-bottom:1px solid #f1f5f9;">
              ${l.flag} ${l.nativeName}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const btn = document.getElementById('yukti-lang-btn');
    const menu = document.getElementById('yukti-lang-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.yukti-lang-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const langCode = opt.getAttribute('data-lang');
        setLanguage(langCode);
        menu.style.display = 'none';
      });
    });

    document.addEventListener('click', () => {
      if (menu) menu.style.display = 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const lang = getCurrentLang();
    translateDocument(lang);
    renderSelector();
  });

  window.addEventListener('yukti-language-changed', (e) => {
    if (e.detail && e.detail.language) {
      translateDocument(e.detail.language);
      renderSelector();
    }
  });
})();
