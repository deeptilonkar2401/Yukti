import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'sat', name: 'Santhali', nativeName: 'संथाली (ᱥᱟᱱᱛᱟᱲᱤ)', flag: '🌾' },
  { code: 'mun', name: 'Mundari', nativeName: 'मुंडारी (ᱢᱩᱱᱰᱟᱨᱤ)', flag: '🌲' },
  { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख (ᱠᱩᱲᱩᱠᱷ)', flag: '🌿' },
];

export const TRANSLATIONS = {
  en: {
    // Header & Nav
    how_it_works: "How it works",
    who_its_for: "Who it's for",
    features: "Features",
    log_in: "Log in",
    sign_up: "Sign up",
    dashboard: "Dashboard",
    my_problems: "My Problems",
    submit_problem: "Submit Problem",
    map_view: "Map View",
    logout: "Logout",
    language: "Language",

    // Hero
    hero_title: "A single pipeline from a reported problem to a working solution.",
    hero_sub: "Yukti connects citizens, government, universities and industry on one platform — so a reported problem doesn't stall, it moves toward a fix.",
    get_started: "Get started",
    see_how_it_works: "See how it works",

    // Pipeline Steps
    p1_title: "1. A problem is reported",
    p1_body: "A short description, a photo, and the exact location — submitted in plain language.",
    p2_title: "2. It's read and scored",
    p2_body: "The report is classified by domain, checked for duplicates, and scored for priority automatically.",
    p3_title: "3. An admin verifies it",
    p3_body: "Duplicates are merged, details confirmed, and the report is released into the pipeline.",
    p4_title: "4. Matched to an institution",
    p4_body: "Expertise, track record and distance decide the best-fit university department to take it on.",
    p5_title: "5. A team forms around it",
    p5_body: "Students join the project, and an industry partner brings funding or mentorship.",
    p6_title: "6. Impact is tracked",
    p6_body: "People reached, cost saved and satisfaction are recorded and reported back to where it started.",

    // Why it exists
    why_exists_title: "Why this exists",
    why_exists_body: "Real problems — a water shortage, a school without working toilets, a road that floods every year — are reported informally, if at all. They rarely reach the university department that could design a fix, or the partner that could fund one. Yukti gives every report a structured path: from the person who lives with it, through verification, to the team equipped to solve it, with the outcome tracked back to where it began.",

    // Roles
    roles_title: "Built for every stakeholder",
    roles_sub: "One platform, four ways in — each with exactly the tools that role needs.",
    role_1_name: "Government / District Admin",
    role_1_detail: "Verify incoming reports, merge duplicates, assign them to institutions, and watch analytics update in real time.",
    role_2_name: "University Dean / Faculty",
    role_2_detail: "Review challenges matched to your department's strengths, accept them, and assemble a student project team.",
    role_3_name: "Industry / CSR Partner",
    role_3_detail: "Discover projects aligned to your focus areas and offer funding, equipment or mentorship.",
    role_4_name: "Citizen",
    role_4_detail: "Report a problem in your own words, attach a photo and location, and follow it until it's resolved.",

    // Features Section
    features_heading: "What's under the hood",
    f1_title: "Classification & priority scoring",
    f1_body: "Every report is domain-tagged and scored on affected population, urgency and severity, with the reasoning shown.",
    f2_title: "Duplicate detection",
    f2_body: "Similar reports are flagged before they fragment attention, so admins merge instead of duplicating effort.",
    f3_title: "Institution & student matching",
    f3_body: "A compatibility score blends subject expertise, track record and geography to suggest the right team.",
    f4_title: "Industry collaboration",
    f4_body: "Partners are matched to projects by domain and funding capacity, not cold outreach.",
    f5_title: "District-level mapping",
    f5_body: "Every report is geo-tagged, so patterns across districts are visible on one map, not buried in a spreadsheet.",
    f6_title: "Impact dashboard",
    f6_body: "Once a solution ships, its outcomes feed into a public record of what actually changed.",

    // CTA
    cta_title: "Have a problem worth solving?",
    cta_sub: "Sign in with your role and see where you fit in the pipeline.",
    cta_button: "Get started",

    // Auth
    portal_login: "Portal Login",
    select_role: "Select Role",
    email_label: "Email",
    password_label: "Password",
    sign_in_btn: "Sign In",
    no_account: "Don't have an account?",
    create_account: "Create an account",
  },
  hi: {
    // Header & Nav
    how_it_works: "यह कैसे काम करता है",
    who_its_for: "यह किसके लिए है",
    features: "विशेषताएं",
    log_in: "लॉग इन",
    sign_up: "साइन अप",
    dashboard: "डैशबोर्ड",
    my_problems: "मेरी समस्याएं",
    submit_problem: "समस्या दर्ज करें",
    map_view: "मानचित्र देखें",
    logout: "लॉगआउट",
    language: "भाषा",

    // Hero
    hero_title: "दर्ज की गई समस्या से लेकर उसके समाधान तक एक ही पाइपलाइन।",
    hero_sub: "युक्ति नागरिकों, सरकार, विश्वविद्यालयों और उद्योगों को एक ही मंच पर जोड़ती है — ताकि दर्ज समस्या रुके नहीं, बल्कि समाधान की ओर बढ़े।",
    get_started: "शुरू करें",
    see_how_it_works: "देखें यह कैसे काम करता है",

    // Pipeline Steps
    p1_title: "1. समस्या दर्ज की जाती है",
    p1_body: "सरल भाषा में संक्षिप्त विवरण, फोटो और सटीक स्थान के साथ विवरण प्रस्तुत किया जाता है।",
    p2_title: "2. जांच और प्राथमिकता का मूल्यांकन",
    p2_body: "रिपोर्ट को विषय क्षेत्र के अनुसार वर्गीकृत किया जाता है, डुप्लिकेट की जांच की जाती है और प्राथमिकता दी जाती है।",
    p3_title: "3. प्रशासन द्वारा सत्यापन",
    p3_body: "समान रिपोर्टों का विलय किया जाता है, विवरण की पुष्टि की जाती है और इसे आगे बढ़ाया जाता है।",
    p4_title: "4. संस्थान का चयन",
    p4_body: "विषय विशेषज्ञता, पिछला रिकॉर्ड और दूरी के आधार पर सबसे उपयुक्त विश्वविद्यालय विभाग को सौंपा जाता है।",
    p5_title: "5. टीम का गठन",
    p5_body: "छात्र परियोजना से जुड़ते हैं, और उद्योग भागीदार वित्त पोषण या मार्गदर्शन प्रदान करते हैं।",
    p6_title: "6. प्रभाव की निगरानी",
    p6_body: "प्रभावित लोगों की संख्या, लागत बचत और संतुष्टि दर को रिकॉर्ड किया जाता है और रिपोर्ट दी जाती है।",

    // Why it exists
    why_exists_title: "यह क्यों आवश्यक है",
    why_exists_body: "वास्तविक समस्याएं — पानी की किल्लत, स्कूलों में शौचालय की कमी, हर साल सड़क पर पानी भरना — अक्सर सही मंच तक नहीं पहुँच पातीं। युक्ति हर रिपोर्ट को एक व्यवस्थित मार्ग प्रदान करती है: समस्या दर्ज करने वाले नागरिक से लेकर सत्यापन, उपयुक्त टीम द्वारा समाधान और अंतिम परिणाम की ट्रैकिंग तक।",

    // Roles
    roles_title: "हर हितधारक के लिए निर्मित",
    roles_sub: "एक ही मंच, चार भूमिकाएं — प्रत्येक के लिए आवश्यक उपकरण।",
    role_1_name: "सरकार / जिला प्रशासन",
    role_1_detail: "प्राप्त रिपोर्टों का सत्यापन करें, डुप्लिकेट विलय करें, संस्थानों को सौंपें और वास्तविक समय में विश्लेषण देखें।",
    role_2_name: "विश्वविद्यालय डीन / संकाय",
    role_2_detail: "अपने विभाग की क्षमताओं के अनुकूल चुनौतियों की समीक्षा करें और छात्र परियोजना टीम बनाएं।",
    role_3_name: "उद्योग / सीएसआर पार्टनर",
    role_3_detail: "अपने प्राथमिक क्षेत्रों से जुड़ी परियोजनाओं की खोज करें और फंडिंग या मेंटरशिप प्रदान करें।",
    role_4_name: "नागरिक",
    role_4_detail: "अपनी भाषा में समस्या दर्ज करें, फोटो और लोकेशन जोड़ें और समाधान होने तक ट्रैक करें।",

    // Features Section
    features_heading: "मुख्य विशेषताएं",
    f1_title: "वर्गीकरण और प्राथमिकता स्कोरिंग",
    f1_body: "प्रत्येक रिपोर्ट को डोमेन टैग किया जाता है और प्रभावित आबादी, तात्कालिकता और गंभीरता के आधार पर स्कोर किया जाता है।",
    f2_title: "डुप्लिकेट पहचान",
    f2_body: "समान रिपोर्टों की पहचान की जाती है ताकि प्रशासन दोबारा प्रयास करने के बजाय विलय कर सके।",
    f3_title: "संस्थान और छात्र मैचिंग",
    f3_body: "विषय विशेषज्ञता और भूगोल को मिलाकर उपयुक्त टीम का सुझाव दिया जाता है।",
    f4_title: "उद्योग सहयोग",
    f4_body: "भागीदारों को डोमेन और फंडिंग क्षमता के अनुसार परियोजनाओं से जोड़ा जाता है।",
    f5_title: "जिला स्तरीय मैपिंग",
    f5_body: "प्रत्येक रिपोर्ट जियो-टैग की जाती है, ताकि पूरे जिले का पैटर्न एक ही नक्शे पर दिखाई दे।",
    f6_title: "प्रभाव डैशबोर्ड",
    f6_body: "समाधान तैयार होने के बाद, उसके परिणाम सार्वजनिक रिकॉर्ड में शामिल किए जाते हैं।",

    // CTA
    cta_title: "क्या आपके पास हल करने योग्य समस्या है?",
    cta_sub: "अपनी भूमिका के साथ साइन इन करें और पाइपलाइन में शामिल हों।",
    cta_button: "शुरू करें",

    // Auth
    portal_login: "पोर्टल लॉगिन",
    select_role: "भूमिका चुनें",
    email_label: "ईमेल",
    password_label: "पासवर्ड",
    sign_in_btn: "साइन इन करें",
    no_account: "खाता नहीं है?",
    create_account: "खाता बनाएं",
  },
  sat: {
    // Header & Nav (Santhali in Devanagari/Ol Chiki script mix)
    how_it_works: "ᱪᱮᱫ ᱞᱮᱠᱟᱛᱮ ᱠᱟᱹᱢᱤᱭᱟ (यह कैसे काम करता है)",
    who_its_for: "ᱚᱠᱚᱭ ᱞᱟᱹᱜᱤᱫ (यह किसके लिए है)",
    features: "ᱜᱩᱱ ᱠᱚ (विशेषताएं)",
    log_in: "ᱞᱚᱜᱽ ᱤᱱ (लॉग इन)",
    sign_up: "ᱥᱟᱭᱤᱱ ᱟᱯ (साइन अप)",
    dashboard: "ᱰᱮᱥᱵᱚᱨᱰ (डैशबोर्ड)",
    my_problems: "ᱤᱧᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ (मेरी समस्याएं)",
    submit_problem: "ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ (समस्या दर्ज करें)",
    map_view: "ᱱᱚᱠᱥᱟ ᱧᱮᱞ (मानचित्र देखें)",
    logout: "ᱞᱚᱜᱽ ᱟᱣᱩᱴ (लॉगआउट)",
    language: "ᱯᱟᱹᱨᱥᱤ (भाषा)",

    // Hero
    hero_title: "ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱷᱚᱱ ᱥᱚᱞᱦᱮ ᱦᱟᱹᱵᱤᱡ ᱢᱤᱫᱴᱟᱹᱝ ᱦᱚᱨ (समस्या से समाधान तक एक पथ)",
    hero_sub: "ᱭᱩᱠᱛᱤ (YUKTI) ᱫᱚ ᱫᱤᱥᱚᱢ ᱦᱚᱲ, ᱥᱚᱨᱠᱟᱨ, ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱟᱨ ᱠᱟᱹᱨᱠᱷᱟᱱᱟ ᱢᱤᱫ ᱴᱷᱟᱶᱨᱮ ᱡᱚᱲᱟᱣᱮᱫ ᱠᱚᱣᱟᱭ।",
    get_started: "ᱮᱦᱚᱵ ᱢᱮ (शुरू करें)",
    see_how_it_works: "ᱧᱮᱞ ᱢᱮ (देखें)",

    // Pipeline Steps
    p1_title: "1. ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ (समस्या दर्ज की जाती है)",
    p1_body: "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱠᱟᱛᱷᱟ, ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱴᱷᱟᱶ ᱨᱮᱱᱟᱜ ᱴᱤᱠᱟᱹᱱᱟ ᱮᱢ ᱢᱮ।",
    p2_title: "2. ᱧᱮᱞ ᱟᱨ ᱵᱤᱪᱟᱹᱨ (जांच और मूल्यांकन)",
    p2_body: "ᱚᱠᱟ ᱞᱮᱠᱟᱱ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱟᱱᱟ ᱚᱱᱟ ᱵᱟᱪᱷᱟᱣ ᱟᱨ ᱥᱚᱞᱦᱮ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱹᱢᱤ।",
    p3_title: "3. ᱥᱚᱨᱠᱟᱨᱤ ᱵᱤᱪᱟᱹᱨ (प्रशासनिक सत्यापन)",
    p3_body: "ᱥᱚᱨᱠᱟᱨᱤ ᱚᱯᱷᱤᱥᱚᱨ ᱠᱚ ᱱᱚᱣᱟ ᱠᱟᱹᱢᱤ ᱞᱟᱦᱟ ᱥᱮᱫ ᱠᱚ ᱤᱫᱤᱭᱟ।",
    p4_title: "4. ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱵᱟᱪᱷᱟᱣ (संस्थान का चयन)",
    p4_body: "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱴᱷᱮᱱ ᱱᱚᱣᱟ ᱠᱟᱹᱢᱤ ᱪᱟᱞᱩᱜᱼᱟ।",
    p5_title: "5. ᱴᱤᱢ ᱵᱮᱱᱟᱣ (टीम का गठन)",
    p5_body: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ (Students) ᱟᱨ ᱠᱟᱹᱨᱠᱷᱟᱱᱟ ᱨᱤᱱ ᱦᱚᱲ ᱢᱤᱫ ᱴᱷᱮᱱ ᱠᱚ ᱠᱟᱹᱢᱤᱭᱟ।",
    p6_title: "6. ᱥᱚᱞᱦᱮ ᱧᱮᱞ (प्रभाव की निगरानी)",
    p6_body: "ᱠᱟᱹᱢᱤ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ ᱥᱮ ᱵᱟᱝ ᱚᱱᱟ ᱨᱮᱱᱟᱜ ᱨᱤᱯᱚᱨᱴ।",

    // Why it exists
    why_exists_title: "ᱪᱮᱫ ᱞᱟᱹᱜᱤᱫ ᱱᱚᱣᱟ (यह क्यों आवश्यक है)",
    why_exists_body: "ᱫᱟᱜ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ, ᱦᱚᱨ ᱰᱟᱦᱟᱨ, ᱟᱥᱲᱟ ᱨᱮᱱᱟᱜ ᱠᱟᱹᱢᱤ — ᱱᱚᱣᱟ ᱠᱚ ᱥᱚᱞᱦᱮ ᱞᱟᱹᱜᱤᱫ ᱭᱩᱠᱛᱤ (YUKTI) ᱯᱚᱨᱴᱟᱞ ᱵᱮᱱᱟᱣ ᱟᱠᱟᱱᱟ।",

    // Roles
    roles_title: "ᱡᱚᱛᱚ ᱦᱚᱲ ᱞᱟᱹᱜᱤᱫ (हर हितधारक के लिए)",
    roles_sub: "ᱢᱤᱫᱴᱟᱹᱝ ᱯᱚᱨᱴᱟᱞ ᱔ ᱴᱷᱟᱶ (एक मंच, चार भूमिकाएं)",
    role_1_name: "ᱥᱚᱨᱠᱟᱨ / ᱡᱤᱞᱟᱹ ᱚᱯᱷᱤᱥᱚᱨ (District Admin)",
    role_1_detail: "ᱨᱤᱯᱚᱨᱴ ᱧᱮᱞ, ᱵᱤᱪᱟᱹᱨ ᱟᱨ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱴᱷᱮᱱ ᱠᱩᱞ।",
    role_2_name: "ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱢᱟᱪᱮᱛ / ᱰᱤᱱ (University)",
    role_2_detail: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱠᱚ ᱥᱟᱶ ᱴᱤᱢ ᱵᱮᱱᱟᱣ ᱠᱟᱛᱮ ᱥᱚᱞᱦᱮ ᱵᱮᱱᱟᱣ।",
    role_3_name: "ᱠᱟᱹᱨᱠᱷᱟᱱᱟ / CSR ᱦᱚᱲ (Industry)",
    role_3_detail: "ᱴᱟᱠᱟ-ᱯᱩᱭᱥᱟᱹ ᱟᱨ ᱜᱚᱲᱚ ᱮᱢ।",
    role_4_name: "ᱫᱤᱥᱚᱢ ᱦᱚᱲ (Citizen)",
    role_4_detail: "ᱟᱯᱱᱟᱨᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱟᱨ ᱥᱚᱞᱦᱮ ᱧᱮᱞ।",

    // Features Section
    features_heading: "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱜᱩᱱ ᱠᱚ",
    f1_title: "ᱵᱟᱪᱷᱟᱣ ᱟᱨ ᱥᱚᱞᱦᱮ ᱦᱚᱨ",
    f1_body: "ᱡᱚᱛᱚ ᱨᱤᱯᱚᱨᱴ ᱴᱷᱤᱠ ᱴᱷᱟᱶᱨᱮ ᱥᱮᱴᱮᱨᱚᱜᱼᱟ।",
    f2_title: "ᱫᱚᱦᱲᱟ ᱨᱤᱯᱚᱨᱴ ᱵᱟᱪᱷᱟᱣ",
    f2_body: "ᱢᱤᱫ ᱞᱮᱠᱟᱱ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱢᱤᱫ ᱴᱷᱮᱱ ᱡᱚᱲᱟᱣᱚᱜᱼᱟ।",
    f3_title: "ᱴᱤᱢ ᱡᱚᱲᱟᱣ",
    f3_body: "ᱴᱷᱤᱠ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱟᱨ ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱠᱚ ᱵᱟᱪᱷᱟᱣᱚᱜᱼᱟ।",
    f4_title: " CSR ᱜᱚᱲᱚ",
    f4_body: "ᱠᱟᱹᱨᱠᱷᱟᱱᱟ ᱨᱤᱱ ᱦᱚᱲ ᱜᱚᱲᱚ ᱠᱚ ᱮᱢᱟ।",
    f5_title: "ᱡᱤᱞᱟᱹ ᱱᱚᱠᱥᱟ",
    f5_body: "ᱱᱚᱠᱥᱟ ᱨᱮ ᱡᱚᱛᱚ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱧᱮᱞᱚᱜᱼᱟ।",
    f6_title: " dashboard",
    f6_body: "ᱠᱟᱹᱢᱤ ᱯᱩᱨᱟᱹᱣ ᱨᱮᱱᱟᱜ ᱨᱤᱯᱚᱨᱴ।",

    // CTA
    cta_title: "ᱮᱴᱠᱮᱴᱚᱬᱮ ᱢᱮᱱᱟᱜᱼᱟ?",
    cta_sub: "ᱥᱟᱭᱤᱱ ᱤᱱ ᱠᱟᱛᱮ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ।",
    cta_button: "ᱮᱦᱚᱵ ᱢᱮ",

    // Auth
    portal_login: "ᱯᱚᱨᱴᱟᱞ ᱞᱚᱜᱽ ᱤᱱ",
    select_role: "ᱠᱟᱹᱢᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
    email_label: "ᱤᱢᱮᱞ (Email)",
    password_label: "ᱯᱟᱥᱣᱟᱨᱰ (Password)",
    sign_in_btn: "ᱞᱚᱜᱽ ᱤᱱ",
    no_account: "ᱟᱠᱟᱣᱩᱱᱴ ᱵᱟᱹᱱᱩᱜᱼᱟ?",
    create_account: "ᱱᱟᱣᱟ ᱟᱠᱟᱣᱩᱱᱴ ᱵᱮᱱᱟᱣ ᱢᱮ",
  },
  mun: {
    // Header & Nav (Mundari)
    how_it_works: "ᱪᱤᱞᱠᱮ ᱠᱟᱹᱢᱤᱭᱟ (यह कैसे काम करता है)",
    who_its_for: "ᱚᱠᱚᱭ ᱞᱟᱹᱜᱤᱱ (यह किसके लिए है)",
    features: "ᱜᱩᱱ ᱠᱚ (विशेषताएं)",
    log_in: "ᱞᱚᱜᱽ ᱤᱱ (लॉग इन)",
    sign_up: "ᱥᱟᱭᱤᱱ ᱟᱯ (साइन अप)",
    dashboard: "ᱰᱮᱥᱵᱚᱨᱰ (डैशबोर्ड)",
    my_problems: "ᱤᱧᱟᱜ ᱫᱩᱠ-ᱦᱟᱥᱩ (मेरी समस्याएं)",
    submit_problem: "ᱫᱩᱠ-ᱦᱟᱥᱩ ᱚᱞ (समस्या दर्ज करें)",
    map_view: "ᱱᱚᱠᱥᱟ ᱧᱮᱞ (मानचित्र देखें)",
    logout: "ᱞᱚᱜᱽ ᱟᱣᱩᱴ (लॉगआउट)",
    language: "ᱡᱟᱜᱟᱨ (भाषा)",

    // Hero
    hero_title: "ᱫᱩᱠ-ᱦᱟᱥᱩ ᱠᱷᱚᱱᱟᱜ ᱥᱚᱞᱦᱮ ᱦᱟᱹᱵᱤᱡ ᱢᱤᱫ ᱦᱚᱨ (समस्या से समाधान तक का सफर)",
    hero_sub: "ᱭᱩᱠᱛᱤ (YUKTI) ᱯᱚᱨᱴᱟᱞ ᱨᱮ ᱱᱟᱜᱽᱨᱤᱠ, ᱥᱚᱨᱠᱟᱨ ᱟᱨ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱢᱤᱫᱴᱟᱹᱝ ᱴᱷᱟᱶᱨᱮ ᱠᱚ ᱡᱚᱲᱟᱣᱟ।",
    get_started: "ᱮᱦᱚᱵᱮᱭᱟᱵᱩ (शुरू करें)",
    see_how_it_works: "ᱧᱮᱞᱮᱭᱟᱵᱩ (देखें)",

    // Pipeline Steps
    p1_title: "1. ᱫᱩᱠ-ᱦᱟᱥᱩ ᱚᱞ (समस्या दर्ज करना)",
    p1_body: "ᱟᱯᱱᱟᱨᱟᱜ ᱡᱟᱜᱟᱨ ᱛᱮ ᱚᱞ ᱯᱮ, ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱴᱷᱟᱶ ᱮᱢ ᱯᱮ।",
    p2_title: "2. ᱡᱟᱸᱪ ᱟᱨ ᱵᱤᱪᱟᱹᱨ",
    p2_body: "ᱚᱠᱟ ᱞᱮᱠᱟᱱ ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟ, ᱚᱱᱟ ᱵᱟᱪᱷᱟᱣᱚᱜᱼᱟ।",
    p3_title: "3. ᱥᱚᱨᱠᱟᱨᱤ ᱚᱯᱷᱤᱥᱚᱨᱟᱜ ᱵᱤᱪᱟᱹᱨ",
    p3_body: "ᱚᱯᱷᱤᱥᱚᱨ ᱠᱚ ᱱᱚᱣᱟ ᱨᱤᱯᱚᱨᱴ ᱠᱚ ᱥᱟᱹᱨᱤᱭᱟ।",
    p4_title: "4. ᱤᱛᱩᱱ ᱟᱥᱲᱟ (College) ᱴᱷᱮᱱ ᱪᱟᱞ",
    p4_body: "ᱠᱚᱞᱮᱡᱽ ᱨᱤᱱ ᱯᱟᱲᱦᱟᱣ ᱠᱚᱲᱟ-ᱠᱩᱲᱤ ᱱᱚᱣᱟ ᱠᱚ ᱥᱚᱞᱦᱮᱭᱟ।",
    p5_title: "5. ᱴᱤᱢ ᱵᱮᱱᱟᱣ",
    p5_body: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱟᱨ ᱠᱟᱹᱨᱠᱷᱟᱱᱟ ᱨᱤᱱ ᱦᱚᱲ ᱥᱟᱶᱛᱮ ᱠᱚ ᱠᱟᱹᱢᱤᱭᱟ।",
    p6_title: "6. ᱥᱚᱞᱦᱮ ᱨᱤᱯᱚᱨᱴ",
    p6_body: "ᱠᱟᱹᱢᱤ ᱪᱤᱞᱠᱮ ᱦᱩᱭᱮᱱᱟ ᱚᱱᱟ ᱨᱮᱱᱟᱜ ᱠᱟᱹᱷᱱᱤ।",

    // Why it exists
    why_exists_title: "ᱪᱮᱫ ᱞᱟᱹᱜᱤᱱ ᱱᱚᱣᱟ",
    why_exists_body: "ᱫᱟᱜ, ᱦᱚᱨ-ᱰᱟᱦᱟᱨ ᱟᱨ ᱟᱥᱲᱟ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱥᱚᱞᱦᱮ ᱞᱟᱹᱜᱤᱱ ᱭᱩᱠᱛᱤ (YUKTI) ᱯᱚᱨᱴᱟᱞ ᱵᱮᱱᱟᱣ ᱟᱠᱟᱱᱟ।",

    // Roles
    roles_title: "ᱡᱚᱛᱚ ᱠᱚ ᱞᱟᱹᱜᱤᱱ",
    roles_sub: "ᱢᱤᱫ ᱴᱷᱟᱶ ᱔ ᱠᱟᱹᱢᱤ",
    role_1_name: "ᱥᱚᱨᱠᱟᱨ / ᱡᱤᱞᱟᱹ ᱚᱯᱷᱤᱥᱚᱨ",
    role_1_detail: "ᱨᱤᱯᱚᱨᱴ ᱧᱮᱞ, ᱵᱤᱪᱟᱹᱨ ᱟᱨ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱴᱷᱮᱱ ᱠᱩᱞ।",
    role_2_name: "ᱠᱚᱞᱮᱡᱽ / ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ",
    role_2_detail: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱠᱚ ᱥᱟᱶ ᱴᱤᱢ ᱵᱮᱱᱟᱣ ᱠᱟᱛᱮ ᱥᱚᱞᱦᱮ ᱵᱮᱱᱟᱣ।",
    role_3_name: "ᱠᱟᱹᱨᱠᱷᱟᱱᱟ / CSR",
    role_3_detail: "ᱯᱩᱭᱥᱟᱹ ᱟᱨ ᱜᱚᱲᱚ ᱮᱢ।",
    role_4_name: "ᱱᱟᱜᱽᱨᱤᱠ (Citizen)",
    role_4_detail: "ᱫᱩᱠ-ᱦᱟᱥᱩ ᱚᱞ ᱟᱨ ᱥᱚᱞᱦᱮ ᱧᱮᱞ।",

    // Features Section
    features_heading: "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱠᱟᱹᱢᱤ ᱠᱚ",
    f1_title: "ᱵᱟᱪᱷᱟᱣ ᱟᱨ ᱥᱚᱞᱦᱮ ᱦᱚᱨ",
    f1_body: "ᱡᱚᱛᱚ ᱨᱤᱯᱚᱨᱴ ᱴᱷᱤᱠ ᱴᱷᱟᱶᱨᱮ ᱥᱮᱴᱮᱨᱚᱜᱼᱟ।",
    f2_title: "ᱫᱚᱦᱲᱟ ᱨᱤᱯᱚᱨᱴ ᱵᱟᱪᱷᱟᱣ",
    f2_body: "ᱢᱤᱫ ᱞᱮᱠᱟᱱ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱢᱤᱫ ᱴᱷᱮᱱ ᱡᱚᱲᱟᱣᱚᱜᱼᱟ।",
    f3_title: "ᱴᱤᱢ ᱡᱚᱲᱟᱣ",
    f3_body: "ᱴᱷᱤᱠ ᱠᱚᱞᱮᱡᱽ ᱟᱨ ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱠᱚ ᱵᱟᱪᱷᱟᱣᱚᱜᱼᱟ।",
    f4_title: " CSR ᱜᱚᱲᱚ",
    f4_body: "ᱠᱟᱹᱨᱠᱷᱟᱱᱟ ᱨᱤᱱ ᱦᱚᱲ ᱜᱚᱲᱚ ᱠᱚ ᱮᱢᱟ।",
    f5_title: "ᱡᱤᱞᱟᱹ ᱱᱚᱠᱥᱟ",
    f5_body: "ᱱᱚᱠᱥᱟ ᱨᱮ ᱡᱚᱛᱚ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱧᱮᱞᱚᱜᱼᱟ।",
    f6_title: " Dashboard",
    f6_body: "ᱠᱟᱹᱢᱤ ᱯᱩᱨᱟᱹᱣ ᱨᱮᱱᱟᱜ ᱨᱤᱯᱚᱨᱴ।",

    // CTA
    cta_title: "ᱮᱴᱠᱮᱴᱚᱬᱮ ᱢᱮᱱᱟᱜᱼᱟ?",
    cta_sub: "ᱥᱟᱭᱤᱱ ᱤᱱ ᱠᱟᱛᱮ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ।",
    cta_button: "ᱮᱦᱚᱵ ᱢᱮ",

    // Auth
    portal_login: "ᱯᱚᱨᱴᱟᱞ ᱞᱚᱜᱽ ᱤᱱ",
    select_role: "ᱠᱟᱹᱢᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
    email_label: "ᱤᱢᱮᱞ",
    password_label: "ᱯᱟᱥᱣᱟᱨᱰ",
    sign_in_btn: "ᱞᱚᱜᱽ ᱤᱱ",
    no_account: "ᱟᱠᱟᱣᱩᱱᱴ ᱵᱟᱹᱱᱩᱜᱼᱟ?",
    create_account: "ᱱᱟᱣᱟ ᱟᱠᱟᱣᱩᱱᱴ ᱵᱮᱱᱟᱣ ᱢᱮ",
  },
  kru: {
    // Header & Nav (Kurukh / Kudukh / Oraon)
    how_it_works: "इद् एकसे कमई (यह कैसे काम करता है)",
    who_its_for: "नेहगे (यह किसके लिए है)",
    features: "गुण (विशेषताएं)",
    log_in: "लॉग इन (Log in)",
    sign_up: "साइन अप (Sign up)",
    dashboard: "डैशबोर्ड (Dashboard)",
    my_problems: "एमही समसिया (मेरी समस्याएं)",
    submit_problem: "समसिया टुड़ा (समस्या दर्ज करें)",
    map_view: "नक्शा (Map View)",
    logout: "लॉगआउट (Logout)",
    language: "कत्था / भाषा",

    // Hero
    hero_title: "समसिया ख़ातिर समाधना गही ओंद्धी होर (समस्या से समाधान तक)",
    hero_sub: "युक्ति (YUKTI) होरिन ओंद्द ठौआ नू जोड़ई - आलन, सरकार, कॉलेज अरु उद्योगिन।",
    get_started: "हुरमी (शुरू करें)",
    see_how_it_works: "इरा (देखें)",

    // Pipeline Steps
    p1_title: "1. समसिया टुड़ा (समस्या दर्ज की जाती है)",
    p1_body: "तंग़ई कत्था नू समसिया, फोटो अरु ठौआ गही नाम टुड़ा।",
    p2_title: "2. जांच अरु परीक्षा",
    p2_body: "एका से समसिया रही ओन्ता बिचार अरु परखा।",
    p3_title: "3. सरकार गही बिचार",
    p3_body: "सरकारी अधिकारी इदीन एर्ना अरु मुन्दभारे चाली।",
    p4_title: "4. कॉलेज गही चुनाव",
    p4_body: "कॉलेज अरु यूनिवर्सिटी गही मास्टरिन इदीन चीइ।",
    p5_title: "5. टीम बनाइ",
    p5_body: "पढ़ुआ ख़द्दर अरु कंपनी गही आलर ओंद्द संधे कमओर।",
    p6_title: "6. नतीजा इरा",
    p6_body: "इद् एका से समाधना मंजा ओंद्धी रिपोर्ट।",

    // Why it exists
    why_exists_title: "इद् एका ख़ातिर",
    why_exists_body: "अम्मा गही समसिया, डहरे गही समसिया, स्कूल गही समसिया नू YUKTI पोर्टल समाधना नंतई।",

    // Roles
    roles_title: "होरिन ख़ातिर",
    roles_sub: "ओंद्द पोर्टल, नाक्ख काम",
    role_1_name: "सरकार / जिला अधिकारी",
    role_1_detail: "रिपोर्ट इरा, जांच ना अरु कॉलेजिन चीइ।",
    role_2_name: "कॉलेज / यूनिवर्सिटी डीन",
    role_2_detail: "पढ़ुआ ख़द्दर संधे टीम बनाइ अरु समाधना कमा।",
    role_3_name: "कंपनी / CSR साथी",
    role_3_detail: "टके-पइसे अरु मदद चीइ।",
    role_4_name: "आलर / नागरिक",
    role_4_detail: "तंग़ई समसिया टुड़ा अरु समाधना इरा।",

    // Features Section
    features_heading: "मुख्य गुण",
    f1_title: "जांच अरु स्कोर",
    f1_body: "हुरमी रिपोर्ट गही सही जांच नंतई।",
    f2_title: "दोहराव इरा",
    f2_body: "ओन्दई समसिया ओंद्द ठौआ नू जोड़ई।",
    f3_title: "टीम चुनाव",
    f3_body: "कॉलेज अरु पढ़ुआ ख़द्दर गही चुनाव।",
    f4_title: "कंपनी मदद",
    f4_body: "कंपनी गही आलर मदद चीइ।",
    f5_title: "जिला नक्शा",
    f5_body: "नक्शा नू हुरमी समसिया एरइ।",
    f6_title: "डैशबोर्ड",
    f6_body: "कमका काम गही रिपोर्ट।",

    // CTA
    cta_title: "समसिया रही?",
    cta_sub: "साइन इन ना अरु समसिया टुड़ा।",
    cta_button: "हुरमी (शुरू करें)",

    // Auth
    portal_login: "पोर्टल लॉगिन",
    select_role: "काम चुना",
    email_label: "ईमेल",
    password_label: "पासवर्ड",
    sign_in_btn: "लॉग इन",
    no_account: "खाता मल्ला?",
    create_account: "पुना खाता बनाइ",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return (
      sessionStorage.getItem('yukti_language') ||
      localStorage.getItem('yukti_language') ||
      'en'
    );
  });

  const changeLanguage = (langCode) => {
    setLanguageState(langCode);
    sessionStorage.setItem('yukti_language', langCode);
    localStorage.setItem('yukti_language', langCode);
    
    // Dispatch window event so non-react scripts / static portals can update immediately
    window.dispatchEvent(new CustomEvent('yukti-language-changed', { detail: { language: langCode } }));
  };

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'yukti_language' && e.newValue) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = (key, fallbackText) => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallbackText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallbackText) => fallbackText || key,
      languages: LANGUAGES
    };
  }
  return context;
};
