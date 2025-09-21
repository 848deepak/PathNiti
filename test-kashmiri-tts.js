/**
 * Test script for Kashmiri language and Global TTS functionality
 * Run this in the browser console on the homepage
 */

console.log('🧪 Testing Kashmiri Language and Global TTS Implementation');

// Test 1: Check if i18n is loaded with all three languages
console.log('1. Testing i18n initialization...');
if (typeof window !== 'undefined' && window.i18next) {
  console.log('✅ i18next is loaded');
  console.log('Current language:', window.i18next.language);
  console.log('Available languages:', window.i18next.languages);
  console.log('Available resources:', Object.keys(window.i18next.options.resources));
} else {
  console.log('❌ i18next not found');
}

// Test 2: Check if TTS service is available
console.log('2. Testing TTS service...');
if (typeof window !== 'undefined' && window.speechSynthesis) {
  console.log('✅ Web Speech API is available');
  console.log('Available voices:', window.speechSynthesis.getVoices().length);
  
  // Check for Kashmiri/Urdu voices
  const voices = window.speechSynthesis.getVoices();
  const kashmiriVoices = voices.filter(v => v.lang.startsWith('ks') || v.lang.includes('urdu'));
  console.log('Kashmiri/Urdu voices found:', kashmiriVoices.length);
} else {
  console.log('❌ Web Speech API not available');
}

// Test 3: Check if language selector is present
console.log('3. Testing language selector...');
const languageSelector = document.querySelector('button[class*="globe"]') ||
                        document.querySelector('button:has(svg)');
if (languageSelector) {
  console.log('✅ Language selector found');
} else {
  console.log('❌ Language selector not found');
}

// Test 4: Check if Global TTS button is present
console.log('4. Testing Global TTS button...');
const globalTTSButton = document.querySelector('button[class*="tts-global"]') ||
                        document.querySelector('button:contains("Read Page")') ||
                        document.querySelector('button[title*="Read"]');
if (globalTTSButton) {
  console.log('✅ Global TTS button found');
} else {
  console.log('❌ Global TTS button not found');
}

// Test 5: Test language switching to Kashmiri
console.log('5. Testing Kashmiri language switching...');
if (window.i18next) {
  const currentLang = window.i18next.language;
  console.log(`Current language: ${currentLang}`);
  
  console.log('Switching to Kashmiri...');
  window.i18next.changeLanguage('ks').then(() => {
    console.log('✅ Successfully switched to Kashmiri');
    console.log('New language:', window.i18next.language);
    
    // Test a translation
    const testTranslation = window.i18next.t('navigation.home');
    console.log('Kashmiri translation for "home":', testTranslation);
  }).catch(err => {
    console.log('❌ Language switch failed:', err);
  });
} else {
  console.log('❌ i18next not available for testing');
}

// Test 6: Test TTS functionality with Kashmiri
console.log('6. Testing TTS functionality...');
if (window.speechSynthesis) {
  const utterance = new SpeechSynthesisUtterance('Hello, this is a test of Kashmiri text-to-speech functionality.');
  utterance.lang = 'ks-Arab'; // Kashmiri language code
  
  utterance.onstart = () => console.log('✅ TTS started');
  utterance.onend = () => console.log('✅ TTS completed');
  utterance.onerror = (e) => {
    if (e.error === 'interrupted') {
      console.log('ℹ️ TTS interrupted (this is normal)');
    } else {
      console.log('❌ TTS error:', e.error);
    }
  };
  
  console.log('Starting TTS test...');
  window.speechSynthesis.speak(utterance);
} else {
  console.log('❌ TTS not available');
}

// Test 7: Check page content extraction
console.log('7. Testing content extraction...');
const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, label, li, td, th, blockquote, article, section, main, header, footer, nav, aside');
const visibleTextElements = Array.from(textElements).filter(el => {
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' && 
         el.offsetWidth > 0 && 
         el.offsetHeight > 0;
});

console.log(`✅ Found ${visibleTextElements.length} visible text elements`);
console.log(`Total text elements: ${textElements.length}`);

// Test 8: Check for any console errors
console.log('8. Checking for errors...');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

setTimeout(() => {
  console.error = originalError;
  if (errorCount === 0) {
    console.log('✅ No errors detected');
  } else {
    console.log(`⚠️ ${errorCount} errors detected (check console above)`);
  }
}, 2000);

console.log('🎉 Test completed! Check the results above.');
console.log('💡 Tip: Try switching languages and using the Global TTS button to test the full functionality.');
