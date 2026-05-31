import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import {
  FileText, Upload, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ChevronUp, Zap, Target, Shield, TrendingUp, Award, BarChart2,
  Loader2, Star, AlertTriangle, Info, RefreshCw, Mail, Copy, Check,
  MessageSquare
} from 'lucide-react';
import './App.css';

const API = 'http://localhost:8000';

// ─── Yardımcı bileşenler ────────────────────────────────────────────────────

function ScoreRing({ score, size = 120, color }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const c = color || (score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={c} strokeWidth="8"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="700" fill={c}>{score}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="10" fill="#6b7280">/ 100</text>
    </svg>
  );
}

function Badge({ text, type }) {
  const styles = {
    yuksek: { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
    orta: { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' },
    dusuk: { bg: '#f0fdf4', color: '#10b981', border: '#bbf7d0' },
    info: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
  };
  const s = styles[type] || styles.info;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600
    }}>{text}</span>
  );
}

function Accordion({ title, icon: Icon, children, defaultOpen = false, accentColor = '#6366f1' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ marginBottom: '12px' }}>
      <button className="accordion-btn" onClick={() => setOpen(!open)}
        style={{ '--accent': accentColor }}>
        <span className="accordion-title">
          <span className="icon-wrap" style={{ background: accentColor + '18', color: accentColor }}>
            <Icon size={18} />
          </span>
          {title}
        </span>
        {open ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

// ─── Upload bölümü ───────────────────────────────────────────────────────────

function UploadSection({ onResult, loading, setLoading }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [error, setError] = useState('');
  const [showJobDesc, setShowJobDesc] = useState(false);

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (r) => setError(r[0]?.errors[0]?.message || 'Geçersiz dosya'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Lütfen bir dosya seçin.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('dosya', file);
      fd.append('is_ilani', jobDesc);
      const res = await axios.post(`${API}/analiz`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onResult(res.data.analiz, file.name, res.data.cv_text || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Sunucu hatası. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="hero-text">
        <div className="hero-badge">✨ AI Destekli</div>
        <h1>CV Analiz & İyileştirme</h1>
        <p>GPT-4o ile CV'nizi analiz edin. Güçlü yönlerinizi öğrenin, eksiklikleri giderin, hayalinizdeki işe kavuşun.</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}>
          <input {...getInputProps()} />
          {file ? (
            <div className="file-preview">
              <FileText size={40} color="#6366f1" />
              <div>
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(0)} KB</div>
              </div>
              <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                <XCircle size={20} />
              </button>
            </div>
          ) : (
            <div className="dropzone-placeholder">
              <Upload size={40} color="#6366f1" />
              <div className="dz-title">{isDragActive ? 'Dosyayı bırakın' : 'CV\'nizi sürükleyin veya tıklayın'}</div>
              <div className="dz-sub">PDF veya DOCX • Maks 5MB</div>
            </div>
          )}
        </div>

        <button type="button" className="job-toggle"
          onClick={() => setShowJobDesc(!showJobDesc)}>
          <Target size={16} />
          {showJobDesc ? 'İş ilanını kapat' : 'İş ilanı ekle (opsiyonel)'}
          {showJobDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showJobDesc && (
          <textarea className="job-textarea" value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
            placeholder="Başvurmak istediğiniz pozisyonun iş ilanını buraya yapıştırın. Bu sayede analiz, o pozisyona göre kişiselleştirilir..."
            rows={5} />
        )}

        {error && (
          <div className="error-box">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button type="submit" disabled={loading || !file} className="submit-btn">
          {loading ? <><Loader2 size={18} className="spin" /> Analiz ediliyor...</> : <><Zap size={18} /> CV'mi Analiz Et</>}
        </button>
      </form>

      <div className="features-row">
        {[
          { icon: Shield, text: 'ATS Uyumluluk Analizi' },
          { icon: Target, text: 'Zayıf Yön Tespiti' },
          { icon: TrendingUp, text: 'İyileştirme Önerileri' },
          { icon: Award, text: 'Kariyer Seviyesi' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="feature-chip"><Icon size={14} />{text}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Başvuru Mesajı bileşeni ─────────────────────────────────────────────────

function BasvuruMesaji({ cvText }) {
  const [isIlani, setIsIlani] = useState('');
  const [ton, setTon] = useState('profesyonel');
  const [uzunluk, setUzunluk] = useState('orta');
  const [mesaj, setMesaj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const olustur = async () => {
    if (!isIlani.trim()) { setError('İş ilanı gerekli.'); return; }
    setLoading(true); setError(''); setMesaj('');
    try {
      const fd = new FormData();
      fd.append('cv_metni', cvText);
      fd.append('is_ilani', isIlani);
      fd.append('ton', ton);
      fd.append('uzunluk', uzunluk);
      const res = await axios.post(`${API}/basvuru-mesaji`, fd);
      setMesaj(res.data.mesaj);
    } catch (err) {
      setError(err.response?.data?.detail || 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const kopyala = () => {
    navigator.clipboard.writeText(mesaj);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="basvuru-wrap">
      <div className="basvuru-header">
        <span className="icon-wrap" style={{ background: '#fdf4ff', color: '#a855f7' }}><Mail size={18} /></span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Başvuru Mesajı Oluştur</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>CV bilgilerinize göre kişiselleştirilmiş mesaj</div>
        </div>
      </div>

      <textarea className="job-textarea" value={isIlani} onChange={e => setIsIlani(e.target.value)}
        placeholder="Başvurmak istediğiniz pozisyonun iş ilanını buraya yapıştırın..." rows={4} />

      <div className="basvuru-options">
        <div className="option-group">
          <label>Ton</label>
          <div className="option-chips">
            {[['profesyonel','🧑‍💼 Profesyonel'],['samimi','😊 Samimi'],['dinamik','⚡ Dinamik']].map(([v,l]) => (
              <button key={v} className={`opt-chip ${ton===v?'active':''}`} onClick={() => setTon(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="option-group">
          <label>Uzunluk</label>
          <div className="option-chips">
            {[['kisa','Kısa'],['orta','Orta'],['uzun','Uzun']].map(([v,l]) => (
              <button key={v} className={`opt-chip ${uzunluk===v?'active':''}`} onClick={() => setUzunluk(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error-box"><AlertCircle size={14} />{error}</div>}

      <button className="submit-btn" style={{ fontSize: 14, padding: '10px 20px' }}
        onClick={olustur} disabled={loading || !isIlani.trim()}>
        {loading ? <><Loader2 size={16} className="spin" />Oluşturuluyor...</> : <><MessageSquare size={16} />Mesaj Oluştur</>}
      </button>

      {mesaj && (
        <div className="mesaj-result">
          <div className="mesaj-toolbar">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' }}>✉️ Başvuru Mesajı</span>
            <button className="copy-btn" onClick={kopyala}>
              {copied ? <><Check size={14} />Kopyalandı!</> : <><Copy size={14} />Kopyala</>}
            </button>
          </div>
          <pre className="mesaj-text">{mesaj}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Sonuç bölümü ────────────────────────────────────────────────────────────

function ResultSection({ analiz, fileName, cvText, onReset }) {
  const {
    genel_puan, ozet, guclu_yonler = [], zayif_yonler = [],
    eksiklikler = [], iyilestirme_onerileri = [], ats_analizi = {},
    bolum_puanlari = {}, kariyer_seviyesi
  } = analiz;

  const radarData = [
    { subject: 'İletişim', value: (bolum_puanlari.iletisim_bilgileri || 0) * 10 },
    { subject: 'Deneyim', value: (bolum_puanlari.is_deneyimi || 0) * 10 },
    { subject: 'Eğitim', value: (bolum_puanlari.egitim || 0) * 10 },
    { subject: 'Beceriler', value: (bolum_puanlari.beceriler || 0) * 10 },
    { subject: 'Format', value: (bolum_puanlari.format_duzen || 0) * 10 },
  ];

  const barData = Object.entries(bolum_puanlari).map(([k, v]) => ({
    name: { iletisim_bilgileri: 'İletişim', is_deneyimi: 'Deneyim', egitim: 'Eğitim', beceriler: 'Beceriler', format_duzen: 'Format' }[k] || k,
    puan: v * 10
  }));

  const priorityLabel = { yuksek: 'Yüksek Öncelik', orta: 'Orta Öncelik', dusuk: 'Düşük Öncelik' };
  const kariyer_labels = { junior: 'Junior', mid: 'Orta Seviye', senior: 'Senior', executive: 'Yönetici', bilinmiyor: 'Belirsiz' };

  return (
    <div className="result-section">
      {/* Üst başlık */}
      <div className="result-header">
        <div>
          <h2>Analiz Sonuçları</h2>
          <p className="file-tag"><FileText size={14} />{fileName}</p>
        </div>
        <button className="reset-btn" onClick={onReset}><RefreshCw size={16} /> Yeni Analiz</button>
      </div>

      {/* Skor + özet kartı */}
      <div className="score-card">
        <div className="score-left">
          <ScoreRing score={genel_puan} size={130} />
          <div>
            <div className="score-label">Genel Puan</div>
            <div className="score-sub">
              {genel_puan >= 75 ? '🎉 Güçlü CV' : genel_puan >= 50 ? '💪 Geliştirilmeli' : '⚠️ Önemli eksikler var'}
            </div>
            {kariyer_seviyesi && kariyer_seviyesi !== 'bilinmiyor' && (
              <Badge text={kariyer_labels[kariyer_seviyesi] || kariyer_seviyesi} type="info" />
            )}
          </div>
        </div>
        <div className="score-right">
          <div className="ozet-title"><Info size={16} color="#6366f1" /> Genel Değerlendirme</div>
          <p className="ozet-text">{ozet}</p>
          <div className="mini-stats">
            <div className="mini-stat success"><CheckCircle size={14} />{guclu_yonler.length} Güçlü Yön</div>
            <div className="mini-stat danger"><XCircle size={14} />{zayif_yonler.length} Zayıf Yön</div>
            <div className="mini-stat warning"><AlertTriangle size={14} />{eksiklikler.length} Eksiklik</div>
          </div>
        </div>
      </div>

      {/* ATS Kartı */}
      <div className="ats-card">
        <div className="ats-left">
          <Shield size={20} color="#6366f1" />
          <div>
            <div className="ats-title">ATS Uyumluluk Skoru</div>
            <div className="ats-sub">Otomatik işe alım sistemleri</div>
          </div>
        </div>
        <div className="ats-right">
          <div className="ats-score" style={{
            color: ats_analizi.puan >= 70 ? '#10b981' : ats_analizi.puan >= 45 ? '#f59e0b' : '#ef4444'
          }}>{ats_analizi.puan || 0}/100</div>
          <div className="ats-bar-wrap">
            <div className="ats-bar" style={{
              width: `${ats_analizi.puan || 0}%`,
              background: ats_analizi.puan >= 70 ? '#10b981' : ats_analizi.puan >= 45 ? '#f59e0b' : '#ef4444'
            }} />
          </div>
        </div>
      </div>

      {/* Grafik satırı */}
      <div className="charts-row">
        <div className="card chart-card">
          <div className="chart-title"><BarChart2 size={16} />Bölüm Puanları</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}/100`]} />
              <Bar dataKey="puan" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.puan >= 70 ? '#10b981' : entry.puan >= 45 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <div className="chart-title"><Target size={16} />Radar Analizi</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Güçlü yönler */}
      {guclu_yonler.length > 0 && (
        <Accordion title={`Güçlü Yönler (${guclu_yonler.length})`} icon={CheckCircle}
          defaultOpen accentColor="#10b981">
          <div className="items-grid">
            {guclu_yonler.map((g, i) => (
              <div key={i} className="item-card success">
                <div className="item-title"><Star size={14} />{g.baslik}</div>
                <div className="item-desc">{g.aciklama}</div>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Zayıf yönler */}
      {zayif_yonler.length > 0 && (
        <Accordion title={`Zayıf Yönler (${zayif_yonler.length})`} icon={XCircle}
          defaultOpen accentColor="#ef4444">
          <div className="items-list">
            {zayif_yonler.map((z, i) => (
              <div key={i} className="item-card danger">
                <div className="item-row">
                  <div className="item-title"><AlertCircle size={14} />{z.baslik}</div>
                  <Badge text={priorityLabel[z.oncelik] || z.oncelik} type={z.oncelik} />
                </div>
                <div className="item-desc">{z.aciklama}</div>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Eksiklikler */}
      {eksiklikler.length > 0 && (
        <Accordion title={`Eksiklikler (${eksiklikler.length})`} icon={AlertTriangle}
          accentColor="#f59e0b">
          <div className="items-list">
            {eksiklikler.map((e, i) => (
              <div key={i} className="item-card warning">
                <div className="item-title"><AlertTriangle size={14} />{e.alan}</div>
                <div className="item-desc">{e.aciklama}</div>
                {e.oneri && (
                  <div className="item-tip">💡 <strong>Öneri:</strong> {e.oneri}</div>
                )}
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* İyileştirme önerileri */}
      {iyilestirme_onerileri.length > 0 && (
        <Accordion title={`İyileştirme Önerileri (${iyilestirme_onerileri.length})`} icon={TrendingUp}
          accentColor="#6366f1">
          <div className="items-list">
            {iyilestirme_onerileri.map((o, i) => (
              <div key={i} className="item-card primary">
                <div className="item-row">
                  <div className="item-title"><Zap size={14} />{o.kategori}</div>
                  <Badge text={o.etki === 'yuksek' ? '🔥 Yüksek Etki' : o.etki === 'orta' ? 'Orta Etki' : 'Düşük Etki'} type={o.etki} />
                </div>
                <div className="item-desc">{o.oneri}</div>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* ATS detay */}
      {(ats_analizi.sorunlar?.length > 0 || ats_analizi.anahtar_kelimeler_eksik?.length > 0) && (
        <Accordion title="ATS Detay Raporu" icon={Shield} accentColor="#8b5cf6">
          {ats_analizi.sorunlar?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="section-label">⚠️ ATS Sorunları</div>
              <ul className="ats-list">
                {ats_analizi.sorunlar.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {ats_analizi.anahtar_kelimeler_eksik?.length > 0 && (
            <div>
              <div className="section-label">🔑 Eksik Anahtar Kelimeler</div>
              <div className="keyword-wrap">
                {ats_analizi.anahtar_kelimeler_eksik.map((k, i) => (
                  <span key={i} className="keyword-chip">{k}</span>
                ))}
              </div>
            </div>
          )}
        </Accordion>
      )}

      {/* Başvuru Mesajı */}
      <Accordion title="Başvuru Mesajı Oluştur" icon={Mail} accentColor="#a855f7">
        <BasvuruMesaji cvText={cvText || ''} />
      </Accordion>
    </div>
  );
}

// ─── Ana uygulama ────────────────────────────────────────────────────────────

export default function App() {
  const [analiz, setAnaliz] = useState(null);
  const [fileName, setFileName] = useState('');
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo"><Zap size={22} />CV Analiz</div>
          <div className="header-tag">GPT-4o Destekli</div>
        </div>
      </header>

      <main className="app-main">
        {!analiz ? (
          <UploadSection
            onResult={(a, n, t) => { setAnaliz(a); setFileName(n); setCvText(t); }}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <ResultSection
            analiz={analiz}
            fileName={fileName}
            cvText={cvText}
            onReset={() => { setAnaliz(null); setFileName(''); setCvText(''); }}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>CV Analiz • AI destekli kariyer danışmanı • Verileriniz işlendikten sonra saklanmaz.</p>
      </footer>
    </div>
  );
}
