'use client';
import { useState, useRef } from 'react';

const SECS = [
  { key: 'diagnostico',        ico: '🔍', title: 'Diagnóstico atual' },
  { key: 'posicionamento',     ico: '🎯', title: 'Posicionamento' },
  { key: 'persona',            ico: '👤', title: 'Persona ideal' },
  { key: 'concorrencia',       ico: '👁',  title: 'Concorrência' },
  { key: 'linhasEditoriais',   ico: '📝', title: 'Linhas Editoriais & Funil' },
  { key: 'calendarioSugerido', ico: '📅', title: 'Calendário sugerido' },
  { key: 'ideiasDeConteudo',   ico: '💡', title: 'Ideias de conteúdo' },
  { key: 'planoDeAcao',        ico: '⚡', title: 'Plano de ação — 30 dias' },
];

function strip(t = '') { return t.replace(/<[^>]+>/g, '').replace(/\*\*(.*?)\*\*/g, '$1'); }
function fmt(t = '') { return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

export default function Home() {
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError]       = useState('');
  const [loadStep, setLoadStep] = useState(0);
  const [screenshots, setScreenshots] = useState([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState([]);
  const [igMode, setIgMode]     = useState('');
  const [niche, setNiche]       = useState('');
  const [goal, setGoal]         = useState('');
  const [freq, setFreq]         = useState('');
  const [exec, setExec]         = useState('');
  const [formErrors, setFormErrors] = useState({});
  const formData = useRef({});

  const go = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Screenshots
  const handleScreenshots = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setScreenshots(files);
    setScreenshotPreviews(files.map(f => URL.createObjectURL(f)));
  };
  const removeScreenshot = (i) => {
    const s = screenshots.filter((_, idx) => idx !== i);
    const p = screenshotPreviews.filter((_, idx) => idx !== i);
    setScreenshots(s); setScreenshotPreviews(p);
  };

  // Validation
  const validate1 = () => {
    const name = document.getElementById('brand-name')?.value?.trim();
    const product = document.getElementById('brand-product')?.value?.trim();
    if (!name || !product || !niche || !goal) {
      setFormErrors({ s1: 'Preencha todos os campos obrigatórios (*).' });
      return false;
    }
    setFormErrors({});
    return true;
  };
  const validate2 = () => {
    const handle = document.getElementById('ig-handle')?.value?.trim();
    if (!handle || !igMode) {
      setFormErrors({ s2: 'Informe o @ do Instagram e escolha como enviar os dados.' });
      return false;
    }
    if (igMode === 'mn' && !document.getElementById('ig-caps')?.value?.trim()) {
      setFormErrors({ s2: 'Cole pelo menos algumas legendas para análise.' });
      return false;
    }
    setFormErrors({});
    return true;
  };

  // GENERATE
  const generate = async () => {
    setLoading(true); setLoadStep(0); go('load');

    // Animate loading steps
    const animSteps = async () => {
      for (let i = 1; i <= 4; i++) { await sleep(1400); setLoadStep(i); }
    };
    animSteps();

    try {
      const fd = new FormData();
      fd.append('brandName',    document.getElementById('brand-name')?.value || '');
      fd.append('brandProduct', document.getElementById('brand-product')?.value || '');
      fd.append('niche',  niche); fd.append('goal', goal);
      fd.append('client', document.getElementById('brand-client')?.value || '');
      fd.append('story',  document.getElementById('brand-story')?.value || '');
      fd.append('igHandle', document.getElementById('ig-handle')?.value || '');
      fd.append('igMode', igMode);
      fd.append('igBio',    document.getElementById('ig-bio')?.value || '');
      fd.append('igCaps',   document.getElementById('ig-caps')?.value || '');
      fd.append('igVisual', document.getElementById('ig-visual')?.value || '');
      fd.append('competitors', document.getElementById('competitors')?.value || '');
      fd.append('freq', freq); fd.append('exec', exec);
      fd.append('pain',  document.getElementById('pain')?.value || '');
      fd.append('extra', document.getElementById('extra')?.value || '');
      screenshots.forEach(f => fd.append('screenshots', f));

      // Store for PDF/Excel
      formData.current = {
        name: document.getElementById('brand-name')?.value || '',
        ig:   document.getElementById('ig-handle')?.value || '',
        niche, goal
      };

      const res = await fetch('/api/generate', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      await sleep(600);
      setStrategy(data.strategy);
      go('res');
    } catch (err) {
      setError(err.message);
      go('res');
    } finally {
      setLoading(false);
    }
  };

  // PDF
  const downloadPDF = async () => {
    const jsPDF = (await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')).jspdf?.jsPDF;
    if (!jsPDF) { alert('Erro ao carregar biblioteca de PDF. Tente novamente.'); return; }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297, ml = 18, mr = 18, tw = W - ml - mr;
    let y = 0;

    const GREEN = [74, 222, 128], DARK = [21, 25, 35], NAVY2 = [37, 43, 59],
          TEXTL = [241, 245, 249], TEXTM = [148, 163, 184], TEXTD = [75, 85, 99];

    const bgPage = () => { doc.setFillColor(...DARK); doc.rect(0, 0, W, H, 'F'); };
    const sideBar = () => { doc.setFillColor(...GREEN); doc.rect(0, 0, 3, H, 'F'); };
    const newPage = () => { doc.addPage(); bgPage(); sideBar(); y = 16; };
    const checkY = (n) => { if (y + n > H - 18) newPage(); };

    // COVER
    bgPage();
    doc.setFillColor(...GREEN); doc.rect(0, 0, W, 3, 'F');
    doc.setFillColor(...GREEN); doc.rect(0, 0, 5, H, 'F');
    doc.setFillColor(...NAVY2); doc.roundedRect(14, 12, 40, 13, 3, 3, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN);
    doc.text('ESTRATEGISTA IA', 34, 20, { align: 'center' });

    y = 85;
    doc.setFontSize(36); doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXTL);
    doc.text('MAPA', ml, y); y += 16;
    doc.setTextColor(...GREEN); doc.text('ESTRATÉGICO', ml, y); y += 16;
    doc.setTextColor(...TEXTL); doc.text('INSTAGRAM', ml, y);

    y += 22;
    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXTM);
    doc.text(formData.current.name || '', ml, y);
    y += 8;
    const h = (formData.current.ig || '').startsWith('@') ? formData.current.ig : '@' + (formData.current.ig || '');
    doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXTD);
    doc.text(h, ml, y);
    y += 14;
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.4); doc.line(ml, y, ml + 55, y);
    y += 10;
    doc.setFontSize(9.5); doc.setTextColor(...TEXTD);
    doc.text('Gerado em ' + new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), ml, y);
    doc.setFontSize(8.5); doc.setTextColor(50, 60, 80);
    doc.text('Criado com Estrategista IA', ml, H - 12);

    const labels = {
      diagnostico: 'DIAGNÓSTICO ATUAL', posicionamento: 'POSICIONAMENTO',
      persona: 'PERSONA IDEAL', concorrencia: 'CONCORRÊNCIA',
      linhasEditoriais: 'LINHAS EDITORIAIS & FUNIL', calendarioSugerido: 'CALENDÁRIO SUGERIDO',
      ideiasDeConteudo: 'IDEIAS DE CONTEÚDO', planoDeAcao: 'PLANO DE AÇÃO — 30 DIAS'
    };
    const nums = { diagnostico:'01', posicionamento:'02', persona:'03', concorrencia:'04', linhasEditoriais:'05', calendarioSugerido:'06', ideiasDeConteudo:'07', planoDeAcao:'08' };

    SECS.forEach(sec => {
      if (!strategy?.[sec.key]) return;
      doc.addPage(); bgPage(); sideBar(); y = 16;
      doc.setFontSize(9); doc.setTextColor(...TEXTD); doc.setFont('helvetica', 'normal');
      doc.text(nums[sec.key] || '', W - mr, y, { align: 'right' });
      doc.setFillColor(...NAVY2); doc.roundedRect(ml, y - 4, tw, 20, 3, 3, 'F');
      doc.setFillColor(...GREEN); doc.roundedRect(ml, y - 4, 4, 20, 2, 2, 'F');
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXTL);
      doc.text(labels[sec.key] || '', ml + 10, y + 7.5);
      y += 26;
      const plain = strip(strategy[sec.key]);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXTM);
      const lines = doc.splitTextToSize(plain, tw);
      lines.forEach(line => {
        if (y > H - 20) { newPage(); doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXTM); }
        const isBold = /^(\d+\.|[-•★])/.test(line.trim()) || /^[A-ZÁÉÍÓÚ]{4,}/.test(line.trim());
        if (isBold) { doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXTL); }
        else { doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXTM); }
        doc.text(line, ml, y); y += 5.2;
      });
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXTD);
      doc.text((formData.current.name || '') + ' · ' + h, ml, H - 8);
      doc.text(new Date().toLocaleDateString('pt-BR'), W - mr, H - 8, { align: 'right' });
    });

    doc.save('mapa-estrategico-' + (formData.current.name || 'marca').toLowerCase().replace(/\s+/g, '-') + '.pdf');
  };

  // EXCEL
  const downloadExcel = async () => {
    const XLSX = await import('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const wb = XLSX.utils.book_new();
    const d = formData.current;
    const h = (d.ig || '').startsWith('@') ? d.ig : '@' + (d.ig || '');

    const addSheet = (name, rows) => {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 30 }, { wch: 100 }];
      XLSX.utils.book_append_sheet(wb, ws, name);
    };

    addSheet('Capa', [
      ['MAPA ESTRATÉGICO INSTAGRAM'], [''],
      ['Marca', d.name], ['Instagram', h], ['Nicho', d.niche],
      ['Objetivo', d.goal], ['Gerado em', new Date().toLocaleDateString('pt-BR')],
    ]);

    const sheetMap = [
      ['01 Diagnóstico', 'diagnostico'],
      ['02 Posicionamento', 'posicionamento'],
      ['03 Persona', 'persona'],
      ['04 Concorrência', 'concorrencia'],
      ['05 Linhas Editoriais', 'linhasEditoriais'],
      ['06 Calendário', 'calendarioSugerido'],
      ['07 Ideias', 'ideiasDeConteudo'],
      ['08 Plano de Ação', 'planoDeAcao'],
    ];

    sheetMap.forEach(([sheetName, key]) => {
      const label = SECS.find(s => s.key === key)?.title || sheetName;
      addSheet(sheetName, [
        [label.toUpperCase(), ''], [''],
        ['Conteúdo', strip(strategy?.[key] || '')],
      ]);
    });

    XLSX.writeFile(wb, 'mapa-estrategico-' + (d.name || 'marca').toLowerCase().replace(/\s+/g, '-') + '.xlsx');
  };

  const loadingSteps = [
    '🔍 Analisando o perfil e o negócio',
    '🎯 Definindo posicionamento',
    '👤 Construindo a persona ideal',
    '📝 Criando pilares e funil',
    '📅 Montando calendário e plano de ação',
  ];

  const niches = ['Moda e Beleza','Alimentação','Saúde e Bem-estar','Educação / Cursos','Casa e Decoração','Serviços','Tecnologia','Pets','Outro'];
  const goals  = ['Vender mais','Crescer seguidores','Construir autoridade','Engajar comunidade','Atrair parcerias'];
  const freqs  = ['Quase não posto','1-2x / semana','3-4x / semana','Todo dia'];
  const execs  = ['Eu mesmo(a)','Assistente','Freelancer','Equipe interna'];

  const igHandle = formData.current?.ig || '';

  return (
    <>
      <style>{`
        header{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(21,25,35,.96);backdrop-filter:blur(12px);z-index:100}
        .logo{display:flex;align-items:center;gap:10px}
        .logo-mark{width:34px;height:34px;background:var(--green-dim);border:1px solid var(--green-border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:var(--green);letter-spacing:.05em}
        .logo-text{font-size:1rem;font-weight:700;color:var(--text);letter-spacing:-.01em}
        .step-bar{display:flex;gap:5px}
        .sb{width:24px;height:3px;border-radius:2px;background:var(--navy4);transition:all .3s}
        .sb-on{background:var(--green)!important}
        .sb-done{background:rgba(74,222,128,.35)!important}
        .wrap{max-width:680px;margin:0 auto;padding:2.5rem 1.5rem 4rem}
        .fadeup{animation:fadeup .3s ease}
        @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .eyebrow{display:inline-flex;align-items:center;gap:7px;background:var(--green-dim);border:1px solid var(--green-border);color:var(--green);padding:5px 13px;border-radius:100px;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:1.75rem}
        .eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0}
        h1{font-size:clamp(1.9rem,4.5vw,2.8rem);font-weight:900;line-height:1.1;letter-spacing:-.04em;margin-bottom:1rem}
        .hl{color:var(--green)}
        .hero-desc{color:var(--text2);font-size:.95rem;max-width:460px;line-height:1.75;margin-bottom:2rem}
        .btn-cta{display:inline-flex;align-items:center;gap:8px;background:var(--green);color:#0D1117;font-size:.9rem;font-weight:700;padding:.875rem 1.75rem;border-radius:100px;border:none;cursor:pointer;transition:all .2s;letter-spacing:-.01em;font-family:inherit}
        .btn-cta:hover{background:var(--green-d);transform:translateY(-2px)}
        .chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:2rem}
        .chip{display:flex;align-items:center;gap:6px;background:var(--navy2);border:1px solid var(--border);padding:6px 13px;border-radius:100px;font-size:12px;color:var(--text2)}
        .chip::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);flex-shrink:0}
        .sh{margin-bottom:1.75rem}
        .sh-num{font-size:11px;font-weight:700;color:var(--green);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.35rem}
        .sh h2{font-size:1.5rem;font-weight:800;letter-spacing:-.03em;line-height:1.2;margin-bottom:.3rem}
        .sh p{color:var(--text2);font-size:.88rem}
        .prog{height:2px;background:var(--navy3);border-radius:2px;overflow:hidden;margin-bottom:2rem}
        .pf{height:100%;background:var(--green);border-radius:2px;transition:width .4s ease}
        .fg{margin-bottom:1.1rem}
        label{display:block;font-size:12.5px;font-weight:600;color:var(--text2);margin-bottom:5px;letter-spacing:.01em;text-transform:uppercase}
        .req{color:var(--green)}
        input[type=text],input[type=password],textarea{width:100%;background:var(--navy2);border:1px solid var(--border2);color:var(--text);border-radius:var(--rs);padding:.75rem .9rem;font-family:inherit;font-size:14px;outline:none;transition:border-color .15s,box-shadow .15s}
        input:focus,textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(74,222,128,.08)}
        input::placeholder,textarea::placeholder{color:var(--text3)}
        textarea{resize:vertical;min-height:88px}
        .card{background:var(--navy2);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem 1.5rem;margin-bottom:1rem}
        .card-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:.4rem}
        .card p{font-size:12.5px;color:var(--text2);line-height:1.6}
        .card a{color:var(--green)}
        .pg{display:flex;flex-wrap:wrap;gap:6px}
        .pc{background:var(--navy2);border:1px solid var(--border2);color:var(--text2);padding:7px 14px;border-radius:100px;font-size:13px;cursor:pointer;transition:all .15s;user-select:none;font-weight:500;font-family:inherit}
        .pc:hover{border-color:var(--green-border);color:var(--text)}
        .pc-sel{background:var(--green-dim)!important;border-color:var(--green)!important;color:var(--green)!important;font-weight:600!important}
        .ig-opt{background:var(--navy2);border:1.5px solid var(--border2);border-radius:var(--r);padding:1rem 1.25rem;cursor:pointer;transition:all .15s;display:flex;align-items:flex-start;gap:.875rem;margin-bottom:8px}
        .ig-opt:hover{border-color:var(--green-border)}
        .ig-opt-sel{border-color:var(--green)!important;background:var(--green-dim)!important}
        .ig-ico{width:36px;height:36px;border-radius:8px;background:var(--navy3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}
        .ig-body h4{font-size:13.5px;font-weight:700;margin-bottom:2px;color:var(--text)}
        .ig-body p{font-size:12px;color:var(--text2);line-height:1.5}
        .badge{align-self:center;margin-left:auto;flex-shrink:0;background:var(--green-dim);color:var(--green);font-size:10px;font-weight:700;padding:3px 9px;border-radius:100px;letter-spacing:.04em}
        .upload-box{background:var(--bg2);border:1.5px dashed var(--border2);border-radius:var(--r);padding:1.5rem;text-align:center;cursor:pointer;transition:all .2s;margin-top:8px}
        .upload-box:hover{border-color:var(--green)}
        .thumbs{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .thumb{position:relative;width:70px;height:70px;border-radius:7px;overflow:hidden;border:1px solid var(--border2)}
        .thumb img{width:100%;height:100%;object-fit:cover}
        .thumb button{position:absolute;top:2px;right:2px;width:17px;height:17px;background:rgba(0,0,0,.8);border:none;border-radius:50%;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .notice{background:rgba(74,222,128,.04);border:1px solid var(--green-border);border-radius:var(--rs);padding:.8rem 1rem;font-size:12.5px;color:var(--text2);margin-top:8px;line-height:1.65}
        .notice strong{color:var(--green)}
        .divider{height:1px;background:var(--border);margin:1.25rem 0}
        .nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border)}
        .btn-back{background:transparent;border:1px solid var(--border2);color:var(--text2);padding:.65rem 1.3rem;border-radius:100px;font-family:inherit;font-size:13.5px;cursor:pointer;transition:all .15s;font-weight:500}
        .btn-next{background:var(--green);border:none;color:#0D1117;padding:.7rem 1.6rem;border-radius:100px;font-family:inherit;font-weight:700;font-size:13.5px;cursor:pointer;transition:all .15s}
        .btn-next:hover{background:var(--green-d)}
        .err-box{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#FCA5A5;padding:8px 12px;border-radius:var(--rs);font-size:12.5px;margin-top:8px}
        .spin{width:56px;height:56px;border-radius:50%;border:2px solid rgba(74,222,128,.15);border-top-color:var(--green);animation:spin 1s linear infinite;margin:0 auto 1.5rem}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ls{display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--navy2);border-radius:var(--rs);font-size:13px;color:var(--text2);transition:all .3s;border:1px solid transparent;margin-bottom:7px}
        .ls-on{color:var(--green)!important;border-color:var(--green-border)!important;background:var(--green-dim)!important}
        .ls-done{color:var(--text)!important}
        .res-header{background:linear-gradient(135deg,var(--navy2) 0%,var(--bg2) 100%);border:1px solid var(--border2);border-radius:var(--r);padding:1.5rem 1.75rem;margin-bottom:1.75rem;position:relative;overflow:hidden}
        .res-header::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--green),transparent)}
        .res-eyebrow{display:inline-flex;align-items:center;gap:5px;background:var(--green-dim);color:var(--green);padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.75rem}
        .res-eyebrow::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);flex-shrink:0}
        .res-header h2{font-size:1.4rem;font-weight:800;letter-spacing:-.025em;margin-bottom:.2rem}
        .res-header p{color:var(--text2);font-size:12.5px}
        .sec{background:var(--navy2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:1rem}
        .sec-hd{display:flex;align-items:center;gap:8px;padding:.85rem 1.25rem;border-bottom:1px solid var(--border)}
        .sec-ico{width:28px;height:28px;border-radius:6px;background:var(--green-dim);display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0}
        .sec-hd h3{font-size:13.5px;font-weight:700;letter-spacing:-.01em}
        .sec-body{padding:1.1rem 1.25rem;font-size:13px;line-height:1.8;color:var(--text2)}
        .sec-body strong{color:var(--text);font-weight:600}
        .res-actions{display:flex;gap:9px;margin-top:1.75rem;flex-wrap:wrap}
        .btn-dl{display:inline-flex;align-items:center;gap:7px;background:var(--green);color:#0D1117;font-family:inherit;font-weight:700;padding:.75rem 1.5rem;border-radius:100px;border:none;cursor:pointer;font-size:13.5px;transition:all .15s}
        .btn-dl:hover{background:var(--green-d)}
        .btn-xl{background:var(--navy2)!important;color:var(--text2)!important;border:1px solid var(--border2)!important}
        .btn-xl:hover{border-color:var(--green)!important;color:var(--green)!important}
        .btn-re{display:inline-flex;align-items:center;gap:7px;background:transparent;color:var(--text2);border:1px solid var(--border2);font-family:inherit;padding:.75rem 1.5rem;border-radius:100px;cursor:pointer;font-size:13.5px;transition:all .15s}
        @media(max-width:540px){header{padding:.875rem 1rem}.wrap{padding:1.75rem 1rem 3rem}h1{font-size:1.75rem}}
      `}</style>

      <header>
        <div className="logo">
          <div className="logo-mark">IA</div>
          <div className="logo-text">Estrategista <span style={{color:'var(--green)'}}>IA</span></div>
        </div>
        <div className="step-bar">
          {[1,2,3,4].map(i => (
            <div key={i} className={`sb ${step===i?'sb-on':''} ${typeof step==='number'&&step>i?'sb-done':''}`}/>
          ))}
        </div>
      </header>

      <div className="wrap">

        {/* HERO */}
        {step === 0 && (
          <div className="fadeup">
            <div className="eyebrow">Estratégia com IA</div>
            <h1>Mapa estratégico<br/><span className="hl">para Instagram</span></h1>
            <p className="hero-desc">Responda perguntas simples, envie prints do seu Instagram, e nossa IA cria um diagnóstico completo + estratégia profissional em minutos.</p>
            <button className="btn-cta" onClick={() => go(1)}>
              Começar agora →
            </button>
            <div className="chips">
              {['Diagnóstico honesto','Posicionamento','Persona ideal','Linhas editoriais','Funil de conteúdo','Calendário','Plano de ação','PDF + Excel'].map(c => (
                <div key={c} className="chip">{c}</div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="fadeup">
            <div className="prog"><div className="pf" style={{width:'25%'}}/></div>
            <div className="sh">
              <div className="sh-num">Passo 1 de 3</div>
              <h2>Sobre a marca</h2>
              <p>Informações básicas do negócio.</p>
            </div>

            <div className="fg">
              <label>Nome da marca <span className="req">*</span></label>
              <input type="text" id="brand-name" placeholder="Ex: Studio Margot, Bianca Doces, Clínica Renove" maxLength={60}/>
            </div>
            <div className="fg">
              <label>O que vende ou oferece <span className="req">*</span></label>
              <input type="text" id="brand-product" placeholder="Ex: roupas plus size, bolos personalizados, consultoria financeira" maxLength={160}/>
            </div>
            <div className="fg">
              <label>Nicho / setor <span className="req">*</span></label>
              <div className="pg">
                {niches.map(n => (
                  <button key={n} className={`pc ${niche===n?'pc-sel':''}`} onClick={() => setNiche(n)}>{n}</button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Objetivo principal no Instagram <span className="req">*</span></label>
              <div className="pg">
                {goals.map(g => (
                  <button key={g} className={`pc ${goal===g?'pc-sel':''}`} onClick={() => setGoal(g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Cliente ideal</label>
              <input type="text" id="brand-client" placeholder="Ex: mulheres 25-40, mães, pequenos empresários" maxLength={160}/>
            </div>
            <div className="fg">
              <label>História e diferencial da marca</label>
              <textarea id="brand-story" placeholder="Como surgiu? O que te diferencia?" maxLength={500}/>
            </div>

            {formErrors.s1 && <div className="err-box">{formErrors.s1}</div>}
            <div className="nav-row">
              <button className="btn-back" onClick={() => go(0)}>← Voltar</button>
              <button className="btn-next" onClick={() => { if(validate1()) go(2); }}>Continuar →</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="fadeup">
            <div className="prog"><div className="pf" style={{width:'50%'}}/></div>
            <div className="sh">
              <div className="sh-num">Passo 2 de 3</div>
              <h2>Seu Instagram</h2>
              <p>Link do perfil + como quer enviar os dados para análise.</p>
            </div>

            <div className="fg">
              <label>Link ou @ do Instagram <span className="req">*</span></label>
              <input type="text" id="ig-handle" placeholder="@suamarca ou instagram.com/suamarca" maxLength={100}/>
            </div>

            <div className="fg">
              <label>Como fornecer os dados <span className="req">*</span></label>
              <div className={`ig-opt ${igMode==='ss'?'ig-opt-sel':''}`} onClick={() => setIgMode('ss')}>
                <div className="ig-ico">📸</div>
                <div className="ig-body">
                  <h4>Screenshots do Instagram</h4>
                  <p>Tire prints do perfil (grid + bio) e de 3 a 5 posts. A IA analisa visualmente.</p>
                </div>
                <div className="badge">Recomendado</div>
              </div>
              <div className={`ig-opt ${igMode==='mn'?'ig-opt-sel':''}`} onClick={() => setIgMode('mn')}>
                <div className="ig-ico">✍️</div>
                <div className="ig-body">
                  <h4>Descrever manualmente</h4>
                  <p>Cole suas últimas legendas e descreva o perfil. Mesmo resultado, mais trabalhoso.</p>
                </div>
              </div>
            </div>

            {igMode === 'ss' && (
              <div>
                <label htmlFor="f-ss" className="upload-box" style={{display:'block'}}>
                  <div style={{fontSize:'1.6rem',marginBottom:'.5rem'}}>🖼️</div>
                  <p style={{color:'var(--text2)',fontSize:'13px'}}>Toque para enviar screenshots</p>
                  <small style={{color:'var(--text3)',fontSize:'11px',display:'block',marginTop:'2px'}}>Print do perfil + 3 a 5 posts — até 6 imagens</small>
                </label>
                <input type="file" id="f-ss" accept="image/*" multiple style={{display:'none'}} onChange={handleScreenshots}/>
                <div className="thumbs">
                  {screenshotPreviews.map((url, i) => (
                    <div key={i} className="thumb">
                      <img src={url} alt=""/>
                      <button onClick={() => removeScreenshot(i)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="notice"><strong>Dica:</strong> Print da página do perfil (bio + grid) + prints de 3 a 5 posts com legenda visível.</div>
              </div>
            )}

            {igMode === 'mn' && (
              <div>
                <div className="fg" style={{marginTop:'10px'}}>
                  <label>Bio do perfil</label>
                  <input type="text" id="ig-bio" placeholder="Cole a bio como aparece no Instagram" maxLength={250}/>
                </div>
                <div className="fg">
                  <label>Últimas 8 a 10 legendas <span className="req">*</span></label>
                  <textarea id="ig-caps" placeholder={'Cole as legendas separadas por ---\n\nLegenda 1...\n---\nLegenda 2...'} style={{minHeight:'150px'}} maxLength={3500}/>
                </div>
                <div className="fg">
                  <label>Visual do perfil</label>
                  <input type="text" id="ig-visual" placeholder="Ex: fotos claras, tons pastel, estilo minimalista" maxLength={200}/>
                </div>
              </div>
            )}

            {formErrors.s2 && <div className="err-box">{formErrors.s2}</div>}
            <div className="nav-row">
              <button className="btn-back" onClick={() => go(1)}>← Voltar</button>
              <button className="btn-next" onClick={() => { if(validate2()) go(3); }}>Continuar →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="fadeup">
            <div className="prog"><div className="pf" style={{width:'75%'}}/></div>
            <div className="sh">
              <div className="sh-num">Passo 3 de 3</div>
              <h2>Contexto estratégico</h2>
              <p>Últimas perguntas para afinar a estratégia.</p>
            </div>

            <div className="fg">
              <label>Concorrentes ou marcas de referência</label>
              <input type="text" id="competitors" placeholder="@marca1, @marca2 — Brasil ou exterior" maxLength={200}/>
            </div>
            <div className="fg">
              <label>Frequência atual de posts</label>
              <div className="pg">
                {freqs.map(f => (
                  <button key={f} className={`pc ${freq===f?'pc-sel':''}`} onClick={() => setFreq(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Quem vai executar o conteúdo?</label>
              <div className="pg">
                {execs.map(e => (
                  <button key={e} className={`pc ${exec===e?'pc-sel':''}`} onClick={() => setExec(e)}>{e}</button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>O que não está funcionando hoje?</label>
              <textarea id="pain" placeholder="Ex: pouco engajamento, não sei o que postar, visual inconsistente..." maxLength={500}/>
            </div>
            <div className="fg">
              <label>Algo mais que a IA deva saber?</label>
              <textarea id="extra" placeholder="Lançamentos, orçamento, tom de voz..." maxLength={400}/>
            </div>

            <div className="nav-row">
              <button className="btn-back" onClick={() => go(2)}>← Voltar</button>
              <button className="btn-next" onClick={generate}>✦ Gerar estratégia</button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {step === 'load' && (
          <div className="fadeup" style={{textAlign:'center',padding:'3rem 0'}}>
            <div className="spin"/>
            <h2 style={{fontSize:'1.3rem',fontWeight:800,letterSpacing:'-.025em',marginBottom:'.4rem'}}>Criando seu mapa estratégico...</h2>
            <p style={{color:'var(--text2)',fontSize:'13px'}}>Isso pode levar até 30 segundos</p>
            <div style={{maxWidth:'320px',margin:'1.5rem auto 0'}}>
              {loadingSteps.map((s, i) => (
                <div key={i} className={`ls ${loadStep===i?'ls-on':''} ${loadStep>i?'ls-done':''}`}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'res' && (
          <div className="fadeup">
            {error ? (
              <div style={{textAlign:'center',padding:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⚠️</div>
                <p style={{fontWeight:600,marginBottom:'.5rem'}}>Erro ao gerar estratégia</p>
                <p style={{color:'var(--text2)',fontSize:'13px'}}>{error}</p>
                <button className="btn-re" style={{marginTop:'1.5rem'}} onClick={() => location.reload()}>↺ Tentar novamente</button>
              </div>
            ) : (
              <>
                <div className="res-header">
                  <div className="res-eyebrow">Mapa Estratégico Gerado</div>
                  <h2>Estratégia para {(formData.current.ig||'').startsWith('@') ? formData.current.ig : '@'+(formData.current.ig||'')}</h2>
                  <p>Gerado em {new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'})}</p>
                </div>
                {SECS.map(s => strategy?.[s.key] ? (
                  <div key={s.key} className="sec">
                    <div className="sec-hd">
                      <div className="sec-ico">{s.ico}</div>
                      <h3>{s.title}</h3>
                    </div>
                    <div className="sec-body" dangerouslySetInnerHTML={{__html: fmt(strategy[s.key])}}/>
                  </div>
                ) : null)}
                <div className="res-actions">
                  <button className="btn-dl" onClick={downloadPDF}>⬇ Baixar PDF</button>
                  <button className="btn-dl btn-xl" onClick={downloadExcel}>📊 Baixar Excel</button>
                  <button className="btn-re" onClick={() => location.reload()}>↺ Nova análise</button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </>
  );
}
