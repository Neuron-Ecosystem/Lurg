'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Card3D from '@/components/Card3D';
import { Camera, Send, RefreshCw } from 'lucide-react';

export default function LurgPage() {
  const [step, setStep] = useState<'start' | 'upload' | 'result'>('start');
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'upload' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setStep('upload');
    }
  };

  const uploadToLurg = async () => {
    if (!image || loading) return;
    setLoading(true);
    try {
      const blob = await fetch(image).then(r => r.blob());
      const fileName = `${Date.now()}.jpg`;
      
      const { data: stData, error: stErr } = await supabase.storage.from('posts').upload(fileName, blob);
      if (stErr) throw stErr;

      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);

      await supabase.from('posts').insert([{ 
        image_url: publicUrl, 
        caption, 
        rank: timer > 15 ? 'S' : 'A' 
      }]);

      setStep('result');
    } catch (err) {
      console.error(err);
      alert("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-6">
      {step === 'start' && (
        <div className="text-center">
          <h1 className="text-7xl font-black mb-8 tracking-tighter italic">LURG</h1>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] mb-10 backdrop-blur-md">
            <p className="text-green-400 font-mono text-sm mb-2">DAY ZERO CHALLENGE:</p>
            <p className="text-2xl font-bold">Последнее фото из галереи + странная подпись</p>
          </div>
          <label className="bg-white text-black px-10 py-5 rounded-full font-black text-xl cursor-pointer hover:scale-105 transition-all flex items-center gap-3">
            <Camera /> ПРИНЯТЬ ВЫЗОВ
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      )}

      {step === 'upload' && (
        <div className="w-full max-w-sm">
          <div className="flex justify-between mb-4 items-center">
            <span className="text-5xl font-black text-purple-500">{timer}s</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs uppercase">Подписывай!</span>
          </div>
          <div className="relative rounded-[32px] overflow-hidden border border-white/20">
            <img src={image!} className="w-full aspect-[3/4] object-cover opacity-80" />
            <textarea 
              className="absolute bottom-0 w-full p-6 bg-black/40 backdrop-blur-lg border-t border-white/10 outline-none text-xl font-medium"
              placeholder="Что тут происходит?..."
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <button onClick={uploadToLurg} disabled={loading} className="w-full mt-6 bg-white text-black py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="animate-spin" /> : <><Send size={20} /> В ХАОС</>}
          </button>
        </div>
      )}

      {step === 'result' && (
        <div className="text-center animate-in fade-in duration-1000">
          <h2 className="text-2xl font-black mb-6 text-green-400">АРТЕФАКТ СОЗДАН</h2>
          <Card3D image={image!} text={caption} rank={timer > 15 ? 'S' : 'A'} />
          <button onClick={() => window.location.reload()} className="mt-10 text-white/30 uppercase text-xs tracking-widest hover:text-white">
            Новый день — новый Lurg
          </button>
        </div>
      )}
    </main>
  );
}
