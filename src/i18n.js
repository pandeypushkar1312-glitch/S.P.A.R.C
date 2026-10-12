// VOLTRIDE Internationalization (i18n) Engine
// Supports English, Tamil (தமிழ்), and Hindi (हिन्दी)

export const translations = {
  en: {
    app_name: "VOLTRIDE",
    tagline: "Autonomous Wireless Charging on Demand",
    nav_home: "Home",
    nav_orders: "Orders",
    nav_wallet: "Wallet",
    nav_profile: "Profile",
    
    // Onboarding
    onboard_title_1: "Charge Wherever You Are",
    onboard_desc_1: "Summon an autonomous Qi charging rover directly to your campus or office location in minutes.",
    onboard_title_2: "Sub-Second Secure Unlock",
    onboard_desc_2: "One-time cryptographically hashed 4-digit PIN ensures only you can activate and charge your phone.",
    onboard_title_3: "High-Power Fast Inductive Qi",
    onboard_desc_3: "Dynamic foreign-object detection and thermal tracking delivering safe 15W wireless charging.",
    btn_skip: "Skip",
    btn_get_started: "Get Started",
    btn_next: "Next",
    
    // Permissions
    perm_title: "Enable Device Permissions",
    perm_desc: "VOLTRIDE requires accurate location to dispatch rovers and notifications for arrival alerts.",
    perm_loc: "GPS Precise Location",
    perm_notif: "Push Notifications",
    btn_allow_all: "Allow & Continue",
    
    // Auth
    auth_title: "Welcome to VOLTRIDE",
    auth_subtitle: "Sign in to order autonomous power rovers",
    auth_phone_placeholder: "Enter 10-digit mobile number",
    auth_get_otp: "Send OTP",
    auth_enter_otp: "Enter 6-digit verification code",
    auth_verify_btn: "Verify & Enter",
    auth_google_btn: "Continue with Google",
    auth_guest_btn: "Continue as Guest",
    
    // Home
    home_search_placeholder: "Where should the rover meet you?",
    home_current_loc: "Use my current location",
    home_available_rovers: "Available Rovers Nearby",
    home_mode_std: "Standard Qi (5W)",
    home_mode_fast: "Fast Turbo Qi (15W)",
    home_target_pct: "Target Device Charge",
    home_est_time: "Est. Duration",
    home_est_cost: "Est. Cost",
    btn_order_now: "Order Rover Now",
    btn_schedule: "Schedule for Later",
    
    // Tracking
    track_title: "Rover Dispatch Status",
    track_status_assigned: "Rover Assigned & Calibrating",
    track_status_enroute: "Rover En Route to You",
    track_status_arrived: "Rover Arrived at Pickup Spot",
    track_eta: "ETA Countdown",
    track_distance: "Distance Remaining",
    track_obstacle_alert: "Obstacle detected — Rover adjusting trajectory",
    btn_share_tracking: "Share Live Track Link",
    btn_cancel_order: "Cancel Request",
    btn_support: "Support / Chat",
    
    // Unlock & Arrival
    unlock_title: "Rover Has Arrived!",
    unlock_desc: "Place your phone on the Qi coil pad and enter this PIN:",
    unlock_locate_btn: "Chirp & Flash Lights",
    unlock_locate_sent: "Signal sent! Rover is beeping & pulsing LEDs.",
    
    // Charging
    charge_title: "Qi Wireless Charging Active",
    charge_live_power: "Live Power",
    charge_energy_deliv: "Energy Delivered",
    charge_pad_temp: "Pad Temperature",
    charge_alignment_good: "Coil Aligned (Optimal)",
    charge_alignment_bad: "Misaligned — Center Phone",
    btn_pause: "Pause Charging",
    btn_resume: "Resume Charging",
    btn_add_time: "+10 Mins",
    btn_end_charge: "Stop & Complete Session",
    
    // Summary
    summary_title: "Session Receipt",
    summary_thanks: "Thanks for using green campus power!",
    summary_co2: "CO2 Offset vs Grid",
    summary_rating_prompt: "How was your charging experience?",
    summary_tip: "Add a Green Fleet Tip",
    btn_download_receipt: "Download PDF Receipt",
    btn_back_home: "Back to Home",
    
    // History & Orders
    history_title: "Your Charging Trips",
    history_filter_all: "All",
    history_filter_week: "This Week",
    history_filter_month: "This Month",
    history_reorder: "Reorder",
    
    // Wallet
    wallet_title: "VoltWallet & Rewards",
    wallet_balance: "Available Balance",
    wallet_topup: "Top Up Wallet",
    wallet_loyalty: "VoltPoints Earned",
    wallet_streak: "Charging Streak",
    wallet_referral: "Your Referral Code",
    
    // Safety
    sos_title: "Emergency Halt",
    sos_hint: "Hold for 2s to actuate rover emergency brake",
    sos_active: "EMERGENCY STOP ENGAGED",
    
    // Settings & Accessibility
    settings_title: "Settings & Fleet Controls",
    a11y_title: "Universal Accessibility Hub",
    a11y_text_size: "Text Size Scaling",
    a11y_bold: "Bold Font Weight",
    a11y_dyslexia: "Dyslexia-Friendly Typography",
    a11y_contrast: "Maximum Contrast Mode",
    a11y_colorblind: "Color Vision Filters",
    a11y_tts: "Screen Reader / Text-to-Speech",
    a11y_voice_cmd: "Voice Commands",
    a11y_easy_mode: "Easy Mode (Oversized Controls)",
    demo_mode_label: "Demo Simulator Mode"
  },
  
  ta: {
    app_name: "வோல்ட்ரைடு",
    tagline: "தேவைக்கேற்ப தன்னாட்சி வயர்லெஸ் சார்ஜிங்",
    nav_home: "முகப்பு",
    nav_orders: "ஆர்டர்கள்",
    nav_wallet: "வாலட்",
    nav_profile: "சுயவிவரம்",
    
    onboard_title_1: "நீங்கள் எங்கிருந்தாலும் சார்ஜ் செய்யுங்கள்",
    onboard_desc_1: "உங்கள் வளாகம் அல்லது அலுவலக இடத்திற்கு சில நிமிடங்களில் தானியங்கி Qi சார்ஜிங் ரோவரை வரவழைக்கவும்.",
    onboard_title_2: "பாதுகாப்பான பின் பூட்டு",
    onboard_desc_2: "பாதுகாப்பான 4-இலக்க PIN மூலம் நீங்கள் மட்டுமே உங்கள் தொலைபேசியை சார்ஜ் செய்ய முடியும்.",
    onboard_title_3: "அதிவேக Qi தூண்டல் சார்ஜிங்",
    onboard_desc_3: "பாதுகாப்பான 15W வயர்லெஸ் சார்ஜிங் மற்றும் வெப்பநிலை கண்காணிப்பு.",
    btn_skip: "தவிர்",
    btn_get_started: "தொடங்குங்கள்",
    btn_next: "அடுத்து",
    
    perm_title: "அனுமதிகளை இயக்கவும்",
    perm_desc: "ரோவரை அனுப்ப துல்லியமான இருப்பிடமும் அறிவிப்புகளும் தேவை.",
    perm_loc: "ஜிபிஎஸ் இருப்பிடம்",
    perm_notif: "அறிவிப்புகள்",
    btn_allow_all: "அனுமதித்து தொடரவும்",
    
    auth_title: "வோல்ட்ரைடுக்கு நல்வரவு",
    auth_subtitle: "ரோவரை ஆர்டர் செய்ய உள்நுழைக",
    auth_phone_placeholder: "10 இலக்க மொபைல் எண்ணை உள்ளிடவும்",
    auth_get_otp: "OTP அனுப்பவும்",
    auth_enter_otp: "6 இலக்க குறியீட்டை உள்ளிடவும்",
    auth_verify_btn: "சரிபார்த்து நுழையவும்",
    auth_google_btn: "கூகிள் மூலம் தொடரவும்",
    auth_guest_btn: "விருந்தினராக தொடரவும்",
    
    home_search_placeholder: "ரோவர் எங்கு வர வேண்டும்?",
    home_current_loc: "எனது தற்போதைய இருப்பிடம்",
    home_available_rovers: "அருகிலுள்ள ரோவர்கள்",
    home_mode_std: "நிலையான Qi (5W)",
    home_mode_fast: "வேகமான டர்போ Qi (15W)",
    home_target_pct: "இலக்கு பேட்டரி அளவு",
    home_est_time: "மதிப்பிடப்பட்ட நேரம்",
    home_est_cost: "மதிப்பிடப்பட்ட கட்டணம்",
    btn_order_now: "ரோவரை ஆர்டர் செய்க",
    btn_schedule: "பின்னர் திட்டமிடுங்கள்",
    
    track_title: "ரோவர் கண்காணிப்பு",
    track_status_assigned: "ரோவர் ஒதுக்கப்பட்டது",
    track_status_enroute: "ரோவர் வந்து கொண்டிருக்கிறது",
    track_status_arrived: "ரோவர் வந்துவிட்டது",
    track_eta: "எதிர்பார்க்கப்படும் நேரம்",
    track_distance: "மீதமுள்ள தூரம்",
    track_obstacle_alert: "தடை கண்டறியப்பட்டது - மாற்றுப் பாதை",
    btn_share_tracking: "இணைப்பைப் பகிரவும்",
    btn_cancel_order: "ஆர்டரை ரத்துசெய்",
    btn_support: "உதவி அரட்டை",
    
    unlock_title: "ரோவர் வந்துவிட்டது!",
    unlock_desc: "தொலைபேசியை வைத்து இந்த PIN ஐ உள்ளிடவும்:",
    unlock_locate_btn: "ஒலி & விளக்கு சமிக்ஞை",
    unlock_locate_sent: "சமிக்ஞை அனுப்பப்பட்டது!",
    
    charge_title: "சார்ஜிங் செயல்பாட்டில் உள்ளது",
    charge_live_power: "தற்போதைய சக்தி",
    charge_energy_deliv: "வழங்கப்பட்ட ஆற்றல்",
    charge_pad_temp: "வெப்பநிலை",
    charge_alignment_good: "சரியான சீரமைப்பு",
    charge_alignment_bad: "மையத்தில் வைக்கவும்",
    btn_pause: "இடைநிறுத்து",
    btn_resume: "மீண்டும் தொடங்கு",
    btn_add_time: "+10 நிமிடம்",
    btn_end_charge: "அமர்வை முடிக்கவும்",
    
    summary_title: "ரசீது",
    summary_thanks: "பயன்படுத்தியதற்கு நன்றி!",
    summary_co2: "சேமிக்கப்பட்ட CO2",
    summary_rating_prompt: "உங்கள் அனுபவம் எப்படி இருந்தது?",
    summary_tip: "டிப் வழங்கவும்",
    btn_download_receipt: "PDF ரசீது பதிவிறக்குக",
    btn_back_home: "முகப்புக்குச் செல்",
    
    history_title: "உங்கள் ஆர்டர்கள்",
    history_filter_all: "அனைத்தும்",
    history_filter_week: "இந்த வாரம்",
    history_filter_month: "இந்த மாதம்",
    history_reorder: "மீண்டும் ஆர்டர் செய்",
    
    wallet_title: "வாலட் & வெகுமதிகள்",
    wallet_balance: "இருப்பு",
    wallet_topup: "டாப் அப்",
    wallet_loyalty: "வோல்ட்பாயிண்ட்ஸ்",
    wallet_streak: "சார்ஜிங் தொடர்",
    wallet_referral: "பரிந்துரை குறியீடு",
    
    sos_title: "அவசர பிரேக்",
    sos_hint: "ரோவரை உடனே நிறுத்த 2 வினாடிகள் அழுத்தவும்",
    sos_active: "அவசர பிரேக் போடப்பட்டது",
    
    settings_title: "அமைப்புகள்",
    a11y_title: "அணுகல்தன்மை மையம்",
    a11y_text_size: "எழுத்து அளவு",
    a11y_bold: "தடிமனான எழுத்து",
    a11y_dyslexia: "டிஸ்லெக்ஸியா எழுத்துரு",
    a11y_contrast: "அதிக மாறுபாடு முறை",
    a11y_colorblind: "வண்ணக்குருடு வடிகட்டி",
    a11y_tts: "திரை வாசிப்பாளர் (TTS)",
    a11y_voice_cmd: "குரல் கட்டளைகள்",
    a11y_easy_mode: "எளிதான பயன்முறை",
    demo_mode_label: "டெமோ சிமுலேட்டர் பயன்முறை"
  },
  
  hi: {
    app_name: "वोल्टराइड",
    tagline: "मांग पर स्वायत्त वायरलेस चार्जिंग रोवर",
    nav_home: "होम",
    nav_orders: "ऑर्डर",
    nav_wallet: "वॉलेट",
    nav_profile: "प्रोफ़ाइल",
    
    onboard_title_1: "कहीं भी, कभी भी चार्ज करें",
    onboard_desc_1: "अपने परिसर या कार्यालय में कुछ ही मिनटों में स्वायत्त क्यूई चार्जिंग रोवर बुलाएं।",
    onboard_title_2: "अत्यधिक सुरक्षित पिन अनलॉक",
    onboard_desc_2: "4-अंकीय सुरक्षित पिन यह सुनिश्चित करता है कि केवल आप ही चार्जिंग शुरू कर सकें।",
    onboard_title_3: "हाई-स्पीड 15W क्यूई फास्ट चार्जिंग",
    onboard_desc_3: "सटीक विदेशी वस्तु पहचान और तापमान नियंत्रण के साथ सुरक्षित चार्जिंग।",
    btn_skip: "छोड़ें",
    btn_get_started: "शुरू करें",
    btn_next: "अगला",
    
    perm_title: "आवश्यक अनुमतियाँ",
    perm_desc: "सटीक लोकेशन और आगमन सूचनाओं के लिए जीपीएस और नोटिफिकेशन आवश्यक हैं।",
    perm_loc: "सटीक जीपीएस लोकेशन",
    perm_notif: "पुश नोटिफिकेशन",
    btn_allow_all: "अनुमति दें और जारी रखें",
    
    auth_title: "वोल्टराइड में आपका स्वागत है",
    auth_subtitle: "रोबोटिक चार्जिंग सेवा हेतु साइन इन करें",
    auth_phone_placeholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
    auth_get_otp: "ओटीपी भेजें",
    auth_enter_otp: "6 अंकों का सत्यापन कोड दर्ज करें",
    auth_verify_btn: "सत्यापित करें",
    auth_google_btn: "गूगल के साथ जारी रखें",
    auth_guest_btn: "गेस्ट मोड में जारी रखें",
    
    home_search_placeholder: "रोवर आपको कहाँ मिले?",
    home_current_loc: "मेरा वर्तमान स्थान",
    home_available_rovers: "आसपास उपलब्ध रोवर",
    home_mode_std: "मानक क्यूई (5W)",
    home_mode_fast: "फास्ट टर्बो क्यूई (15W)",
    home_target_pct: "लक्षित बैटरी स्तर",
    home_est_time: "अनुमानित समय",
    home_est_cost: "अनुमानित लागत",
    btn_order_now: "रोवर ऑर्डर करें",
    btn_schedule: "बाद के लिए शेड्यूल करें",
    
    track_title: "लाइव ट्रैकिंग",
    track_status_assigned: "रोवर सौंपा गया",
    track_status_enroute: "रोवर आपके रास्ते में है",
    track_status_arrived: "रोवर पहुंच गया है",
    track_eta: "पहुंचने का समय",
    track_distance: "शेष दूरी",
    track_obstacle_alert: "बाधा का पता चला - वैकल्पिक मार्ग चुना गया",
    btn_share_tracking: "ट्रैकिंग लिंक साझा करें",
    btn_cancel_order: "ऑर्डर रद्द करें",
    btn_support: "सहायता चैट",
    
    unlock_title: "रोवर पहुंच गया!",
    unlock_desc: "फोन पैड पर रखें और यह पिन दर्ज करें:",
    unlock_locate_btn: "आवाज और लाइट ब्लिंक करें",
    unlock_locate_sent: "सिग्नल भेजा गया!",
    
    charge_title: "वायरलेस चार्जिंग सक्रिय",
    charge_live_power: "लाइव पावर",
    charge_energy_deliv: "ऊर्जा वितरित",
    charge_pad_temp: "पैड तापमान",
    charge_alignment_good: "सटीक अलाइनमेंट",
    charge_alignment_bad: "फोन को बीच में रखें",
    btn_pause: "चार्जिंग रोकें",
    btn_resume: "पुनः आरंभ करें",
    btn_add_time: "+10 मिनट जोड़ें",
    btn_end_charge: "सत्र समाप्त करें",
    
    summary_title: "डिजिटल रसीद",
    summary_thanks: "ग्रीन चार्जिंग सेवा का उपयोग करने के लिए धन्यवाद!",
    summary_co2: "बचाई गई CO2",
    summary_rating_prompt: "आपका अनुभव कैसा रहा?",
    summary_tip: "टिप जोड़ें",
    btn_download_receipt: "पीडीएफ रसीद डाउनलोड करें",
    btn_back_home: "होम पर वापस जाएं",
    
    history_title: "चार्जिंग इतिहास",
    history_filter_all: "सभी",
    history_filter_week: "इस सप्ताह",
    history_filter_month: "इस माह",
    history_reorder: "पुनः ऑर्डर करें",
    
    wallet_title: "वॉलेट और रिवार्ड्स",
    wallet_balance: "उपलब्ध बैलेंस",
    wallet_topup: "वॉलेट रिचार्ज करें",
    wallet_loyalty: "अर्जित वोल्टप्वाइंट्स",
    wallet_streak: "चार्जिंग स्ट्रीक",
    wallet_referral: "रेफरल कोड",
    
    sos_title: "आपातकालीन ब्रेक (SOS)",
    sos_hint: "तुरंत ब्रेक लगाने के लिए 2 सेकंड दबाए रखें",
    sos_active: "इमरजेंसी स्टॉप सक्रिय",
    
    settings_title: "सेटिंग्स एवं फ्लीट",
    a11y_title: "सुलभता केंद्र (Accessibility)",
    a11y_text_size: "टेक्स्ट का आकार",
    a11y_bold: "बोल्ड टेक्स्ट",
    a11y_dyslexia: "डिस्लेक्सिया-अनुकूल फ़ॉन्ट",
    a11y_contrast: "उच्च कंट्रास्ट मोड",
    a11y_colorblind: "कलरब्लाइंड फ़िल्टर",
    a11y_tts: "स्क्रीन रीडर (आवाज)",
    a11y_voice_cmd: "वॉइस कमांड",
    a11y_easy_mode: "आसान मोड (बड़े बटन)",
    demo_mode_label: "डेमो सिम्युलेटर मोड"
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang][key]) {
        el.textContent = translations[currentLang][key];
      }
    });
  }
}

export function t(key) {
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}

export function getCurrentLanguage() {
  return currentLang;
}
