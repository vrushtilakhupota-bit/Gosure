import { useState } from 'react';
import Header from '../components/Header';

type P = [string, string?];
const EN = ['Please help me!', 'Call the police.', 'I need an ambulance.', 'I need a doctor.', 'I am lost.', 'Where is the nearest hospital?', 'Where is the police station?', "I don't feel safe.", 'Leave me alone!', 'Stop, thief!', 'Please call my emergency contact.'];

const LANGS: { id: string; name: string; voice: string; p: P[] }[] = [
  { id: 'hi', name: 'Hindi', voice: 'hi-IN', p: [['मेरी मदद कीजिए!', 'Meri madad kijiye!'], ['पुलिस को बुलाइए।', 'Police ko bulaiye.'], ['मुझे एम्बुलेंस चाहिए।', 'Mujhe ambulance chahiye.'], ['मुझे डॉक्टर चाहिए।', 'Mujhe doctor chahiye.'], ['मैं रास्ता भूल गया/गई हूँ।', 'Main rasta bhool gaya/gayi hoon.'], ['नज़दीकी अस्पताल कहाँ है?', 'Nazdeeki aspataal kahan hai?'], ['पुलिस स्टेशन कहाँ है?', 'Police station kahan hai?'], ['मुझे सुरक्षित महसूस नहीं हो रहा।', 'Mujhe surakshit mehsoos nahin ho raha.'], ['मुझे अकेला छोड़ दो!', 'Mujhe akela chhod do!'], ['चोर! रुको!', 'Chor! Ruko!'], ['कृपया मेरे आपातकालीन संपर्क को फ़ोन कीजिए।', 'Kripya mere aapatkaalin sampark ko phone kijiye.']] },
  { id: 'gu', name: 'Gujarati', voice: 'gu-IN', p: [['મને મદદ કરો!', 'Mane madad karo!'], ['પોલીસને બોલાવો.', 'Police ne bolavo.'], ['મને એમ્બ્યુલન્સ જોઈએ છે.', 'Mane ambulance joie chhe.'], ['મને ડૉક્ટર જોઈએ છે.', 'Mane doctor joie chhe.'], ['હું રસ્તો ભૂલી ગયો/ગઈ છું.', 'Hu rasto bhuli gayo/gai chhu.'], ['નજીકની હોસ્પિટલ ક્યાં છે?', 'Najikni hospital kyan chhe?'], ['પોલીસ સ્ટેશન ક્યાં છે?', 'Police station kyan chhe?'], ['મને સુરક્ષિત લાગતું નથી.', 'Mane surakshit lagtu nathi.'], ['મને એકલો/એકલી છોડી દો!', 'Mane eklo/ekli chhodi do!'], ['ચોર! ઊભા રહો!', 'Chor! Ubha raho!'], ['કૃપા કરીને મારા ઇમરજન્સી સંપર્કને ફોન કરો.', 'Krupa kari ne mara emergency sampark ne phone karo.']] },
  { id: 'es', name: 'Spanish', voice: 'es-ES', p: [['¡Ayúdeme, por favor!'], ['Llame a la policía.'], ['Necesito una ambulancia.'], ['Necesito un médico.'], ['Estoy perdido/a.'], ['¿Dónde está el hospital más cercano?'], ['¿Dónde está la comisaría?'], ['No me siento seguro/a.'], ['¡Déjeme en paz!'], ['¡Al ladrón!'], ['Por favor, llame a mi contacto de emergencia.']] },
  { id: 'fr', name: 'French', voice: 'fr-FR', p: [["Aidez-moi, s'il vous plaît !"], ['Appelez la police.'], ["J'ai besoin d'une ambulance."], ["J'ai besoin d'un médecin."], ['Je suis perdu(e).'], ["Où est l'hôpital le plus proche ?"], ['Où est le commissariat ?'], ['Je ne me sens pas en sécurité.'], ['Laissez-moi tranquille !'], ['Au voleur !'], ["Veuillez appeler mon contact d'urgence."]] },
  { id: 'de', name: 'German', voice: 'de-DE', p: [['Helfen Sie mir, bitte!'], ['Rufen Sie die Polizei.'], ['Ich brauche einen Krankenwagen.'], ['Ich brauche einen Arzt.'], ['Ich habe mich verlaufen.'], ['Wo ist das nächste Krankenhaus?'], ['Wo ist die Polizeiwache?'], ['Ich fühle mich nicht sicher.'], ['Lassen Sie mich in Ruhe!'], ['Haltet den Dieb!'], ['Bitte rufen Sie meinen Notfallkontakt an.']] },
  { id: 'ja', name: 'Japanese', voice: 'ja-JP', p: [['助けてください！', 'Tasukete kudasai!'], ['警察を呼んでください。', 'Keisatsu o yonde kudasai.'], ['救急車が必要です。', 'Kyūkyūsha ga hitsuyō desu.'], ['医者が必要です。', 'Isha ga hitsuyō desu.'], ['道に迷いました。', 'Michi ni mayoimashita.'], ['一番近い病院はどこですか？', 'Ichiban chikai byōin wa doko desu ka?'], ['警察署はどこですか？', 'Keisatsusho wa doko desu ka?'], ['身の危険を感じます。', 'Mi no kiken o kanjimasu.'], ['放っておいてください！', 'Hotte oite kudasai!'], ['泥棒！', 'Dorobō!'], ['緊急連絡先に電話してください。', 'Kinkyū renrakusaki ni denwa shite kudasai.']] },
  { id: 'ar', name: 'Arabic', voice: 'ar-SA', p: [['ساعدني من فضلك!', "Sa'idni min fadlak!"], ['اتصل بالشرطة.', 'Ittasil bish-shurta.'], ['أحتاج إلى سيارة إسعاف.', "Ahtaj ila sayyarat is'af."], ['أحتاج إلى طبيب.', 'Ahtaj ila tabib.'], ['أنا تائه.', "Ana ta'ih."], ['أين أقرب مستشفى؟', 'Ayna aqrab mustashfa?'], ['أين مركز الشرطة؟', 'Ayna markaz ash-shurta?'], ['لا أشعر بالأمان.', "La ash'ur bil-aman."], ['دعني وشأني!', "Da'ni wa sha'ni!"], ['حرامي!', 'Harami!'], ['من فضلك اتصل بجهة الاتصال في حالات الطوارئ.', "Min fadlak ittasil bi-jihat al-ittisal fi halat at-tawari'."]] },
];

export default function PhraseHelperScreen() {
  const [lang, setLang] = useState('hi');
  const [big, setBig] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const L = LANGS.find((l) => l.id === lang)!;

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = L.voice; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };
  const copy = (i: number) => { navigator.clipboard?.writeText(L.p[i][0]); setCopied(i); setTimeout(() => setCopied(null), 1200); };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Emergency Language Helper" dark />
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto shrink-0">
        {LANGS.map((l) => (
          <button key={l.id} onClick={() => setLang(l.id)} aria-pressed={lang === l.id} className="ios-chip">{l.name}</button>
        ))}
      </div>
      <p className="px-4 pb-2 text-[11px]" style={{ color: '#607580' }}>Tap a phrase to show it full-screen to a local, or use 🔊 to play it aloud.</p>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {L.p.map((ph, i) => (
          <div key={i} className="glass-card p-4">
            <button className="w-full text-left" onClick={() => setBig(i)}>
              <p className="text-[11px]" style={{ color: '#607580' }}>{EN[i]}</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: '#073B4C' }}>{ph[0]}</p>
              {ph[1] && <p className="text-xs italic mt-0.5" style={{ color: '#19B5A5' }}>{ph[1]}</p>}
            </button>
            <div className="flex gap-2 mt-2">
              <button onClick={() => speak(ph[0])} className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white" style={{ backgroundColor: 'rgba(120,120,128,0.12)', color: '#102A36' }}>🔊 Play</button>
              <button onClick={() => copy(i)} className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white" style={{ backgroundColor: 'rgba(120,120,128,0.12)', color: '#102A36' }}>{copied === i ? '✓ Copied' : 'Copy'}</button>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-center pt-2" style={{ color: '#8A9BA5' }}>Audio depends on voices installed on your device.</p>
      </div>

      {big !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: '#073B4C', zIndex: 60 }} onClick={() => setBig(null)}>
          <p className="text-sm mb-6" style={{ color: '#87D8EA' }}>{L.name}</p>
          <p className="text-4xl font-bold text-white leading-snug" dir={lang === 'ar' ? 'rtl' : undefined}>{L.p[big][0]}</p>
          {L.p[big][1] && <p className="text-lg mt-4 italic" style={{ color: '#87D8EA' }}>{L.p[big][1]}</p>}
          <p className="text-sm mt-8 text-white/70">{EN[big]}</p>
          <button onClick={(e) => { e.stopPropagation(); speak(L.p[big][0]); }} className="mt-8 px-6 py-3 rounded-full font-semibold" style={{ backgroundColor: '#19B5A5', color: 'white' }}>🔊 Play</button>
          <p className="text-xs mt-6 text-white/50">Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}
