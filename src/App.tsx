import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, ChevronRight, Copy, BookOpen, Layers, Lightbulb, Info, ExternalLink, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { commands, libraryMeta, categoryMeta, quickFilters, scenarios } from './data';
import { 
  buildOfficialReferences, 
  buildParameterDocs, 
  buildRecommendedUse, 
  buildProfessionalDetail 
} from './knowledge';
import type { Command, LibraryMeta, CategoryMeta, Scenario } from './types';

// Helper to highlight matching text (simple version)
const highlightText = (text: string, query: string) => {
  if (!query) return <span>{text}</span>;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span>{text}</span>;
  
  // Build a regex that matches any of the terms
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        terms.some(term => part.toLowerCase() === term.toLowerCase())
          ? <span key={i} className="bg-accent/40 text-neon font-bold px-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-accent/30">{part}</span>
          : part
      )}
    </span>
  );
};

const KnowledgeBlock = ({ icon, title, content }: { icon: any, title: string, content: any }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  return (
    <section>
      <div className="flex items-center gap-2 mb-4 text-neon">
        {icon}
        <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-4">
        {content}
      </div>
    </section>
  );
};

const VisualPreview = ({ type }: { type: string }) => {
  const themes = {
    bg: "#0f172a",
    card: "#1e293b",
    header: "#334155",
    accent: "#3b82f6",
    text: "#94a3b8",
    line: "#334155"
  };

  switch (type) {
    case "tableflow":
      return (
        <svg viewBox="0 0 320 200" className="w-full h-auto drop-shadow-2xl">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#1e293b", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0f172a", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="320" height="200" rx="32" fill="url(#grad1)" />
          <g transform="translate(40 50)">
            {/* Input File */}
            <rect x="0" y="20" width="80" height="60" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="0" y="20" width="80" height="15" rx="12" fill="#334155" />
            <path d="M10 45 H70 M10 60 H70" stroke="#334155" strokeWidth="1" />
            
            {/* Arrow */}
            <path d="M100 50 H140" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <path d="M132 40 L145 50 L132 60" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Output DataFrame */}
            <rect x="160" y="0" width="100" height="100" rx="16" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.5" />
            <rect x="160" y="0" width="100" height="20" rx="16" fill="#3b82f6" fillOpacity="0.2" />
            {/* Data Rows */}
            <g opacity="0.6">
              {[20, 40, 60, 80].map(y => (
                <line key={y} x1="160" y1={y} x2="260" y2={y} stroke="#334155" />
              ))}
              {[190, 220].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#334155" />
              ))}
            </g>
          </g>
          <text x="160" y="170" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold" letterSpacing="0.1em">FILE → DATAFRAME</text>
        </svg>
      );
    case "joinflow":
      return (
        <svg viewBox="0 0 320 200" className="w-full h-auto drop-shadow-2xl">
          <rect x="0" y="0" width="320" height="200" rx="32" fill="#0f172a" />
          <g transform="translate(45 55)">
            {/* Table A */}
            <rect x="0" y="10" width="70" height="80" rx="12" fill="#1e293b" stroke="#334155" />
            <rect x="0" y="10" width="70" height="15" rx="12" fill="#334155" />
            <rect x="0" y="25" width="25" height="65" rx="0" fill="#3b82f6" fillOpacity="0.15" />
            
            {/* Table B */}
            <rect x="50" y="30" width="70" height="80" rx="12" fill="#1e293b" stroke="#334155" strokeOpacity="0.8" />
            <rect x="50" y="30" width="70" height="15" rx="12" fill="#3b82f6" fillOpacity="0.2" />
            <rect x="50" y="45" width="25" height="65" rx="0" fill="#3b82f6" fillOpacity="0.15" />

            {/* Linkage */}
            <circle cx="62" cy="70" r="15" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
            
            {/* Result */}
            <path d="M140 65 H175" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <rect x="195" y="15" width="100" height="90" rx="16" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
            <rect x="195" y="15" width="100" height="20" rx="16" fill="#10b981" fillOpacity="0.15" />
          </g>
          <text x="160" y="175" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold" letterSpacing="0.1em">LEFT JOIN MERGE</text>
        </svg>
      );
    case "reshapeflow":
      return (
        <svg viewBox="0 0 320 200" className="w-full h-auto drop-shadow-2xl">
          <rect x="0" y="0" width="320" height="200" rx="32" fill="#0f172a" />
          <g transform="translate(50 50)">
            {/* Wide Table */}
            <rect x="0" y="20" width="100" height="60" rx="12" fill="#1e293b" stroke="#334155" />
            <g opacity="0.5">
              <line x1="33" y1="20" x2="33" y2="80" stroke="#334155" />
              <line x1="66" y1="20" x2="66" y2="80" stroke="#334155" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#334155" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="#334155" />
            </g>
            
            {/* Arrow */}
            <path d="M115 50 H145" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            
            {/* Long Table */}
            <rect x="165" y="0" width="50" height="100" rx="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
            <g opacity="0.3">
              {[20, 40, 60, 80].map(y => (
                <line key={y} x1="165" y1={y} x2="215" y2={y} stroke="#3b82f6" />
              ))}
              <line x1="190" y1="0" x2="190" y2="100" stroke="#3b82f6" />
            </g>
          </g>
          <text x="160" y="175" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold" letterSpacing="0.1em">WIDE ↔ LONG RESHAPE</text>
        </svg>
      );
    case "pivotflow":
      return (
        <svg viewBox="0 0 320 200" className="w-full h-auto drop-shadow-2xl">
          <rect x="0" y="0" width="320" height="200" rx="32" fill="#0f172a" />
          <g transform="translate(40 40)">
            {/* Input Data */}
            <rect x="0" y="20" width="60" height="80" rx="8" fill="#1e293b" stroke="#334155" />
            <rect x="0" y="20" width="60" height="15" rx="8" fill="#334155" />
            
            {/* Arrow with Label */}
            <path d="M80 60 H130" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            <text x="105" y="50" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="black" letterSpacing="0.1em">AGGREGATE</text>

            {/* Pivot Table */}
            <rect x="150" y="10" width="100" height="100" rx="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.6" />
            <rect x="150" y="10" width="100" height="25" rx="16" fill="#f59e0b" fillOpacity="0.15" />
            <rect x="150" y="10" width="30" height="100" rx="16" fill="#f59e0b" fillOpacity="0.1" />
            
            <g opacity="0.4">
              {[35, 60, 85].map(y => <line key={y} x1="150" y1={y} x2="250" y2={y} stroke="#f59e0b" strokeWidth="1" />)}
              {[180, 215].map(x => <line key={x} x1={x} y1="10" x2={x} y2="110" stroke="#f59e0b" strokeWidth="1" />)}
            </g>
          </g>
          <text x="160" y="170" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold" letterSpacing="0.1em">PIVOT TABLE ANALYSIS</text>
        </svg>
      );
    case "summarycard":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(34 38)">
            <rect x="0" y="0" width="72" height="48" rx="16" fill="#d7ece8" />
            <rect x="86" y="0" width="72" height="48" rx="16" fill="#efc58c" />
            <rect x="172" y="0" width="72" height="48" rx="16" fill="#cfe8e2" />
            <rect x="0" y="62" width="244" height="54" rx="16" fill="#ffffff" stroke="#d5e1e5" />
            <path d="M16 98 C40 88, 70 76, 98 84 S148 106, 180 90 S218 70, 228 74" fill="none" stroke="#1f6f78" strokeWidth="4" />
          </g>
        </svg>
      );
    case "timeline":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(32 42)">
            <line x1="0" y1="84" x2="248" y2="84" stroke="#cad7dc" strokeWidth="2" />
            <g fill="#1f6f78">
              <circle cx="20" cy="84" r="6" />
              <circle cx="70" cy="60" r="6" />
              <circle cx="120" cy="68" r="6" />
              <circle cx="170" cy="36" r="6" />
              <circle cx="220" cy="44" r="6" />
            </g>
            <path d="M20 84 C40 74, 56 62, 70 60 S104 66, 120 68 S154 44, 170 36 S206 42, 220 44" fill="none" stroke="#1f6f78" strokeWidth="4" />
            <path d="M20 84 C52 74, 88 70, 120 68 S188 52, 220 44" fill="none" stroke="#b9793e" strokeWidth="3" strokeDasharray="8 6" />
          </g>
        </svg>
      );
    case "arrayrow":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(34 70)">
            <rect x="0" y="0" width="44" height="36" rx="10" fill="#d7ece8" />
            <rect x="50" y="0" width="44" height="36" rx="10" fill="#cfe8e2" />
            <rect x="100" y="0" width="44" height="36" rx="10" fill="#efc58c" />
            <rect x="150" y="0" width="44" height="36" rx="10" fill="#b7ddd5" />
            <rect x="200" y="0" width="44" height="36" rx="10" fill="#d7ece8" />
          </g>
        </svg>
      );
    case "arraygrid":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(62 34)" fill="#ffffff" stroke="#d5e1e5">
            <rect x="0" y="0" width="44" height="34" rx="10" />
            <rect x="50" y="0" width="44" height="34" rx="10" fill="#d7ece8" />
            <rect x="100" y="0" width="44" height="34" rx="10" />
            <rect x="0" y="40" width="44" height="34" rx="10" fill="#efc58c" />
            <rect x="50" y="40" width="44" height="34" rx="10" />
            <rect x="100" y="40" width="44" height="34" rx="10" fill="#cfe8e2" />
            <rect x="0" y="80" width="44" height="34" rx="10" />
            <rect x="50" y="80" width="44" height="34" rx="10" fill="#d7ece8" />
            <rect x="100" y="80" width="44" height="34" rx="10" />
          </g>
          <path d="M232 56 L262 56" stroke="#1f6f78" strokeWidth="5" strokeLinecap="round" />
          <path d="M256 44 L270 56 L256 68" fill="none" stroke="#1f6f78" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "matrixcard":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(44 42)">
            <rect x="0" y="0" width="78" height="78" rx="14" fill="#ffffff" stroke="#d5e1e5" />
            <rect x="126" y="0" width="78" height="78" rx="14" fill="#ffffff" stroke="#d5e1e5" />
            <path d="M92 38 L112 38" stroke="#b9793e" strokeWidth="5" strokeLinecap="round" />
            <path d="M106 26 L120 38 L106 50" fill="none" stroke="#b9793e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="62" y="92" width="140" height="22" rx="11" fill="#d7ece8" />
          </g>
        </svg>
      );
    case "decisionflow":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(40 38)">
            <path d="M76 8 L124 40 L76 72 L28 40 Z" fill="#d7ece8" />
            <path d="M164 8 L212 40 L164 72 L116 40 Z" fill="#efc58c" />
            <path d="M252 8 L300 40 L252 72 L204 40 Z" transform="translate(-20 0)" fill="#cfe8e2" />
            <path d="M124 40 H146" stroke="#1f6f78" strokeWidth="4" />
            <path d="M212 40 H234" stroke="#1f6f78" strokeWidth="4" />
            <rect x="32" y="90" width="180" height="24" rx="12" fill="#ffffff" stroke="#d5e1e5" />
          </g>
        </svg>
      );
    case "statscard":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(36 36)">
            <rect x="0" y="0" width="70" height="44" rx="16" fill="#d7ece8" />
            <rect x="82" y="0" width="70" height="44" rx="16" fill="#efc58c" />
            <rect x="164" y="0" width="70" height="44" rx="16" fill="#cfe8e2" />
            <rect x="0" y="58" width="234" height="54" rx="18" fill="#ffffff" stroke="#d5e1e5" />
            <path d="M22 94 C42 82, 54 70, 74 68 S108 84, 124 80 S150 58, 186 56" fill="none" stroke="#1f6f78" strokeWidth="4" />
          </g>
        </svg>
      );
    case "interpolatecurve":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(38 38)">
            <path d="M10 98 C42 86, 66 38, 92 44 S148 86, 178 70 S212 24, 232 20" fill="none" stroke="#1f6f78" strokeWidth="4" />
            <path d="M10 98 L44 80 L86 46 L140 82 L196 48 L232 20" fill="none" stroke="#b9793e" strokeWidth="3" strokeDasharray="6 6" />
            <g fill="#b9793e">
              <circle cx="10" cy="98" r="5" />
              <circle cx="44" cy="80" r="5" />
              <circle cx="86" cy="46" r="5" />
              <circle cx="140" cy="82" r="5" />
              <circle cx="196" cy="48" r="5" />
              <circle cx="232" cy="20" r="5" />
            </g>
          </g>
        </svg>
      );
    case "signalwave":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(34 46)">
            <path d="M0 64 C18 42, 36 88, 54 36 S90 26, 108 60 S144 86, 162 46 S198 30, 216 58" fill="none" stroke="#b9793e" strokeWidth="3" strokeDasharray="7 6" />
            <path d="M0 60 C18 52, 36 64, 54 50 S90 42, 108 52 S144 70, 162 56 S198 44, 216 50" fill="none" stroke="#1f6f78" strokeWidth="4" />
            <g fill="#1f6f78">
              <circle cx="54" cy="50" r="5" />
              <circle cx="108" cy="52" r="5" />
              <circle cx="162" cy="56" r="5" />
            </g>
          </g>
        </svg>
      );
    case "optimizepath":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(38 32)">
            <path d="M20 18 C92 12, 144 74, 212 114" fill="none" stroke="#d5e1e5" strokeWidth="18" strokeLinecap="round" opacity="0.6" />
            <path d="M28 22 C72 28, 106 54, 136 76 S182 104, 210 110" fill="none" stroke="#1f6f78" strokeWidth="4" strokeDasharray="7 6" />
            <g fill="#b9793e">
              <circle cx="28" cy="22" r="6" />
              <circle cx="88" cy="42" r="6" />
              <circle cx="136" cy="76" r="6" />
              <circle cx="180" cy="100" r="6" />
              <circle cx="210" cy="110" r="7" />
            </g>
          </g>
        </svg>
      );
    case "forecastpanel":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(32 36)">
            <rect x="0" y="0" width="110" height="108" rx="16" fill="#ffffff" stroke="#d5e1e5" />
            <rect x="126" y="0" width="110" height="108" rx="16" fill="#ffffff" stroke="#d5e1e5" />
            <path d="M12 82 C30 70, 48 56, 66 60 S88 84, 98 52" fill="none" stroke="#1f6f78" strokeWidth="4" />
            <path d="M138 84 C154 78, 170 74, 184 64 S210 36, 224 28" fill="none" stroke="#b9793e" strokeWidth="4" />
          </g>
        </svg>
      );
    case "modelsummary":
      return (
        <svg viewBox="0 0 320 190" className="w-full h-auto drop-shadow-sm">
          <rect x="16" y="16" width="288" height="158" rx="24" fill="#f8faf9" />
          <g transform="translate(38 34)">
            <rect x="0" y="0" width="244" height="110" rx="16" fill="#ffffff" stroke="#d5e1e5" />
            <rect x="0" y="0" width="244" height="24" rx="16" fill="#d7ece8" />
            <line x1="0" y1="24" x2="244" y2="24" stroke="#d5e1e5" />
            <line x1="0" y1="52" x2="244" y2="52" stroke="#d5e1e5" />
            <line x1="0" y1="80" x2="244" y2="80" stroke="#d5e1e5" />
            <rect x="20" y="34" width="204" height="8" rx="4" fill="#cfe8e2" />
            <rect x="20" y="62" width="140" height="8" rx="4" fill="#cfe8e2" />
            <rect x="20" y="90" width="180" height="8" rx="4" fill="#cfe8e2" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export default function App() {
  const [library, setLibrary] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [showFullParams, setShowFullParams] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Logic helpers
  const indexedCommands = useMemo(() => {
    return commands.map((command: any) => {
      const fullCommand = {
        ...command,
        officialReferences: buildOfficialReferences(command),
        parameters: buildParameterDocs(command),
        recommendedUse: buildRecommendedUse(command),
        professionalDetail: buildProfessionalDetail(command),
      };
      
      const searchBlob = [
        fullCommand.title,
        fullCommand.alias,
        fullCommand.summary,
        fullCommand.library,
        categoryMeta[fullCommand.category as keyof typeof categoryMeta]?.label ?? "",
        fullCommand.keywords.join(" "),
        fullCommand.tips.join(" "),
        fullCommand.recommendedUse.join(" "),
        fullCommand.professionalDetail,
        fullCommand.parameters.map((item: any) => `${item.name} ${item.meaning} ${item.detail}`).join(" "),
        (fullCommand.officialReferences ?? []).map((item: any) => `${item.label} ${item.note} ${item.source}`).join(" "),
      ].join(" ").toLowerCase();

      return {
        ...fullCommand,
        searchBlob,
      };
    });
  }, []);

  const filteredCommands = useMemo(() => {
    if (!search) {
      return indexedCommands.filter(cmd => {
        const matchLib = library === 'all' || cmd.library === library;
        const matchCat = category === 'all' || cmd.category === category;
        
        let matchScenario = true;
        if (scenarioId) {
          const scenario = scenarios.find(s => s.id === scenarioId);
          if (scenario) {
            matchScenario = scenario.steps.includes(cmd.id);
          }
        }
        return matchLib && matchCat && matchScenario;
      });
    }

    const query = search.toLowerCase().trim();
    const terms = query.split(/\s+/);

    const scored = indexedCommands.map(cmd => {
      let score = 0;
      const title = cmd.title.toLowerCase();
      const alias = (cmd.alias || "").toLowerCase();
      const summary = cmd.summary.toLowerCase();
      const keywords = cmd.keywords.map((k: string) => k.toLowerCase());

      // 1. Exact matches (highest priority)
      if (title === query || alias === query) score += 1000;
      else if (title.includes(query)) score += 500;
      else if (alias.includes(query)) score += 400;

      // 2. Term matches
      terms.forEach(term => {
        if (title.includes(term)) score += 100;
        if (alias.includes(term)) score += 80;
        if (summary.includes(term)) score += 40;
        if (keywords.some((k: string) => k.includes(term))) score += 50;
        if (cmd.searchBlob.includes(term)) score += 10;
      });

      // 3. Library/Category contextual bonus if they match filter
      const matchLib = library === 'all' || cmd.library === library;
      const matchCat = category === 'all' || cmd.category === category;
      if (matchLib) score *= 1.2;
      if (matchCat) score *= 1.1;

      return { cmd, score };
    })
    .filter(item => {
      const { cmd } = item;
      const matchLib = library === 'all' || cmd.library === library;
      const matchCat = category === 'all' || cmd.category === category;
      
      let matchScenario = true;
      if (scenarioId) {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (scenario) {
          matchScenario = scenario.steps.includes(cmd.id);
        }
      }

      // If there's a search, we want items that match at least some terms or library/category
      return item.score > 0 && matchLib && matchCat && matchScenario;
    })
    .sort((a, b) => b.score - a.score);

    return scored.map(item => item.cmd);
  }, [indexedCommands, library, category, search, scenarioId]);

  // Initialize selectedId if null or not in current filtered results
  useEffect(() => {
    if (filteredCommands.length > 0) {
      if (!selectedId || !filteredCommands.find(cmd => cmd.id === selectedId)) {
        setSelectedId(filteredCommands[0].id);
      }
    }
  }, [filteredCommands, selectedId]);

  const selectedCommand = useMemo(() => {
    return indexedCommands.find(cmd => cmd.id === selectedId) || null;
  }, [indexedCommands, selectedId]);

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === scenarioId) || null;
  }, [scenarioId]);

  const handleQuickFilter = (f: any) => {
    setLibrary(f.library);
    setCategory(f.category);
    setSearch(f.search);
    setScenarioId(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1480px] mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row items-end justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
               <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-neon text-[10px] font-black tracking-[0.2em] uppercase">
              Py Data Terminal v4.0
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-6 font-display text-white">
            Py Data <span className="text-accent underline decoration-4 decoration-accent/20 underline-offset-8">Desk</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            专业级数据科学指令集。面向 <code className="text-neon bg-accent/10 px-2 py-0.5 rounded font-mono text-sm border border-accent/20">pandas</code>、
            <code className="text-neon bg-accent/10 px-2 py-0.5 rounded font-mono text-sm border border-accent/20">numpy</code>、
            <code className="text-neon bg-accent/10 px-2 py-0.5 rounded font-mono text-sm border border-accent/20">scipy</code> 提供离线极速索引与可视化指导。
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 min-w-[320px]"
        >
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <span className="block text-4xl font-black tracking-tighter font-display text-white">{indexedCommands.length}</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mt-1">Directives</span>
          </div>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <span className="block text-4xl font-black tracking-tighter font-display text-white">{scenarios.length}</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mt-1">Workflows</span>
          </div>
        </motion.div>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_460px] gap-6 items-start">
        
        {/* Left Sidebar: Filters */}
        <aside className="space-y-10 lg:sticky lg:top-8 h-fit lg:max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
          <section>
            <div className="mb-6">
              <span className="text-neon text-[10px] font-black tracking-[0.1em] uppercase block mb-1">Index Layer</span>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Layers size={16} className="text-accent" />
                资源库范围
              </h2>
            </div>
            <div className="space-y-2">
              {Object.entries(libraryMeta).map(([id, meta]: [string, any]) => (
                <button
                  key={id}
                  onClick={() => { setLibrary(id); setScenarioId(null); }}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${
                    library === id 
                      ? 'bg-accent border-accent text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] scale-[1.03] z-10' 
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20 text-slate-400'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-black text-base leading-none mb-2 ${library === id ? 'text-white' : 'text-slate-100 group-hover:text-accent transition-colors'}`}>{meta.label}</div>
                    <div className={`text-[11px] font-medium ${library === id ? 'text-white/80' : 'text-slate-500'}`}>{meta.note}</div>
                  </div>
                  <div className={`transition-transform duration-300 ${library === id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>
                    <ChevronRight size={18} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-6">
              <span className="text-neon text-[10px] font-black tracking-[0.1em] uppercase block mb-1">Category Filters</span>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Filter size={16} className="text-accent" />
                任务类型
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryMeta).map(([id, meta]: [string, any]) => (
                <button
                  key={id}
                  onClick={() => { setCategory(id); setScenarioId(null); }}
                  className={`p-3 rounded-xl border text-[11px] font-bold transition-all ${
                    category === id 
                      ? 'bg-slate-700 border-accent/50 text-white shadow-inner' 
                      : 'bg-white/[0.03] border-white/5 hover:border-white/20 text-slate-400'
                  }`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 rounded-[2rem] border-accent/10 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 mb-4 text-neon">
              <Lightbulb size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider">Terminal Tips</h3>
            </div>
            <ul className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-accent font-black">/</span>
                <span>使用顶栏通过自然语言搜索 API 功能。</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-black">/</span>
                <span>场景化教学模组支持自动高亮相关指令。</span>
              </li>
            </ul>
          </section>
        </aside>

        {/* Center: Search & Results */}
        <main className="space-y-6 min-w-0">
          {/* Search Box */}
          <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-neon text-[10px] font-black tracking-[0.2em] uppercase block mb-1">Query Processor</span>
                <h2 className="text-2xl font-black tracking-tight text-white font-display">Command Search</h2>
              </div>
              <p className="text-right text-[10px] leading-relaxed text-slate-500 max-w-[200px] hidden sm:block font-mono">
                TRY: <code>merge</code>, <code>interpolate</code>, <code>mask</code>
              </p>
            </div>

            <div className="relative flex gap-3 z-10">
              <div className="relative flex-1 group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-accent transition-colors">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Scan library for directives..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all font-medium text-slate-100 placeholder:text-slate-600 shadow-inner"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setLibrary('all');
                  setCategory('all');
                  setSearch('');
                  setScenarioId(null);
                }}
                className="px-8 rounded-2xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] font-black text-xs uppercase tracking-widest text-slate-300 transition-all active:scale-95"
              >
                Reset
              </button>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap gap-2.5 z-10 relative">
              {quickFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickFilter(f)}
                  className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-accent/30 hover:bg-white/[0.08] hover:text-accent transition-all"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Rail */}
          <div className="glass-panel p-8 rounded-[2.5rem]">
            <div className="mb-8">
              <span className="text-neon text-[10px] font-black tracking-[0.2em] uppercase block mb-1">Operational Workflows</span>
              <h2 className="text-2xl font-black tracking-tight text-white font-display">按场景引导</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenarioId(s.id === scenarioId ? null : s.id)}
                  className={`text-left p-5 rounded-2xl border transition-all h-full flex flex-col ${
                    scenarioId === s.id 
                      ? 'bg-accent/10 border-accent/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`block font-bold text-sm mb-2 ${scenarioId === s.id ? 'text-accent' : 'text-slate-200'}`}>{s.title}</span>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed flex-1 italic">{s.summary}</p>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {activeScenario && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="text-neon text-[9px] font-black tracking-[0.2em] uppercase">Pipeline sequence</span>
                       <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {activeScenario.steps.map((stepId) => (
                        <button
                          key={stepId}
                          onClick={() => setSelectedId(stepId)}
                          className={`px-4 py-2 rounded-xl border text-[11px] font-black transition-all ${
                            selectedId === stepId
                              ? 'bg-accent border-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/30'
                          }`}
                        >
                          {stepId}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results List */}
          <div className="glass-panel p-8 rounded-[2.5rem] min-h-[500px]">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div>
                <span className="text-neon text-[10px] font-black tracking-[0.2em] uppercase block mb-1">Matching Directives</span>
                <h2 className="text-2xl font-black tracking-tight text-white font-display">匹配结果</h2>
              </div>
              <div className="px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {filteredCommands.length} Found
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredCommands.slice(0, 50).map((cmd, idx) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.01 }}
                    key={cmd.id}
                    onClick={() => setSelectedId(cmd.id)}
                    className={`w-full text-left p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                      selectedId === cmd.id 
                        ? 'bg-accent/10 border-accent/40 shadow-[0_0_40px_rgba(59,130,246,0.1)]' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-bold tracking-tight truncate ${selectedId === cmd.id ? 'text-white' : 'text-slate-200 group-hover:text-neon transition-colors'}`}>
                          {highlightText(cmd.title, search)}
                        </h3>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-neon text-[8px] font-black uppercase border border-accent/20">
                            {cmd.library}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[8px] font-black uppercase border border-white/5">
                            {categoryMeta[cmd.category as keyof typeof categoryMeta]?.label}
                          </span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-xl transition-all ${selectedId === cmd.id ? 'bg-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/[0.03] text-slate-500'}`}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {highlightText(cmd.summary, search)}
                    </p>
                    <code className="text-[10px] block mt-4 font-mono text-accent opacity-80 whitespace-nowrap overflow-hidden text-ellipsis bg-black/30 p-2 rounded-lg border border-white/5">
                      {cmd.syntax}
                    </code>
                    {selectedId === cmd.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_#3b82f6]"
                      />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>

              {filteredCommands.length === 0 && (
                <div className="py-20 text-center glass-panel rounded-3xl border-dashed">
                  <BookOpen size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matching directives found</p>
                  <p className="text-xs text-slate-600 mt-2">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel: Detail Inspector */}
        <aside className="sticky top-6 h-[calc(100vh-3rem)] flex flex-col">
          <AnimatePresence mode="wait">
            {selectedCommand ? (
              <motion.div
                key={selectedCommand.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col glass-panel rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl"
              >
                {/* Visual Preview Header */}
                <div className="relative group p-2">
                  <div className="absolute top-6 left-6 z-10">
                    <span className="bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-accent/20 border border-white/10">
                      Visualization
                    </span>
                  </div>
                  {selectedCommand.visualDemo && <VisualPreview type={selectedCommand.visualDemo.type} />}
                  {!selectedCommand.visualDemo && (
                    <div className="h-48 flex items-center justify-center bg-slate-900/50 rounded-3xl border border-dashed border-white/5 mx-2 mt-2">
                      <BookOpen size={32} className="text-slate-800" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                  <div className="mb-8 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-accent text-[9px] font-black uppercase tracking-[0.2em]">{selectedCommand.library} directive</span>
                      <div className="h-px flex-1 bg-accent/20" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-white leading-tight mb-4">{selectedCommand.title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed font-normal">{selectedCommand.summary}</p>
                  </div>

                  <div className="space-y-8">
                    {/* Logic Syntax Block */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-neon">
                          <ChevronRight size={14} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Syntax Definition</h3>
                        </div>
                        <button 
                          onClick={() => handleCopy(selectedCommand.code, selectedCommand.id)}
                          className="flex items-center gap-2 text-[10px] font-bold bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-xl transition-all border border-white/10 text-slate-300"
                        >
                          {copiedId === selectedCommand.id ? 'Copied' : 'Copy'}
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="bg-[#0a0c10] border border-white/10 p-6 rounded-2xl relative overflow-hidden group shadow-inner">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl rounded-full" />
                        <code className="text-neon font-mono text-xs block leading-relaxed break-all relative z-10">
                          {selectedCommand.syntax}
                        </code>
                        <div className="mt-4 pt-4 border-t border-white/5">
                           <pre className="text-[11px] text-slate-100 font-mono leading-relaxed whitespace-pre-wrap">
                             {selectedCommand.code}
                           </pre>
                        </div>
                      </div>
                    </section>

                    {/* Technical Layers */}
                    <KnowledgeBlock 
                      icon={<Info size={14} />} 
                      title="官方参考" 
                      content={selectedCommand.officialReferences?.map((ref, idx) => (
                        <a key={idx} href={ref.url} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-accent/40 hover:bg-accent/5 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{ref.source}</span>
                             <ExternalLink size={12} className="text-slate-600 group-hover:text-accent" />
                          </div>
                          <div className="text-xs font-bold text-slate-200 mb-1">{ref.label}</div>
                          <div className="text-[10px] text-slate-500 leading-relaxed italic">{ref.note}</div>
                        </a>
                      ))} 
                    />
                    
                    {/* Parameters Section */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neon">
                          <Info size={14} />
                          <h3 className="text-xs font-black uppercase tracking-widest">参数细节 (PARAMETERS)</h3>
                        </div>
                        <button 
                          onClick={() => setShowFullParams(!showFullParams)}
                          className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-1.5 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20 active:scale-95"
                        >
                          {showFullParams ? "收起核心" : "查看完整参数"}
                          <ChevronRight size={12} className={`transition-transform duration-300 ${showFullParams ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      <div className="space-y-8">
                        {/* Grouped Parameters */}
                        {(() => {
                          const params = (selectedCommand.parameters || [])
                            .filter(Boolean)
                            .filter(p => !showFullParams ? p?.isCommon : true);
                          
                          const groups: Record<string, any[]> = {};
                          params.forEach(p => {
                            const g = p.group || '通用参数';
                            if (!groups[g]) groups[g] = [];
                            groups[g].push(p);
                          });

                          return Object.entries(groups).map(([groupName, groupParams]) => (
                            <div key={groupName} className="space-y-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{groupName}</span>
                                <div className="h-px flex-1 bg-white/5" />
                              </div>
                              <div className="space-y-4">
                                {groupParams.map((p, idx) => (
                                  <div key={idx} className={`p-5 rounded-3xl border transition-all relative group/item ${
                                    p?.isCommon ? 'bg-white/[0.02] border-white/5' : 'bg-transparent border-dashed border-white/5 opacity-80'
                                  }`}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                      <div className="text-sm font-black text-neon tracking-tight flex items-center gap-2">
                                        {p?.name}
                                        {p?.isCommon && <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {p?.type && <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/10 backdrop-blur-sm">{p.type}</span>}
                                        {p?.defaultValue !== undefined && <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/10 backdrop-blur-sm">def: {p.defaultValue}</span>}
                                      </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-200 mb-2 leading-relaxed">{p?.meaning}</div>
                                    <div className="text-[10px] text-slate-500 leading-relaxed font-normal bg-black/30 p-4 rounded-2xl border border-white/5 group-hover/item:border-white/10 transition-all">{p?.detail}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </section>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-400 mb-4">
                          <Info size={14} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">推荐场景 (Scenarios)</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCommand.recommendedUse?.map((use, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-slate-400">
                              {use}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-400 mb-4">
                          <Info size={14} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">专家提示 (Extra Tips)</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedCommand.tips?.map((tip, idx) => (
                            <li key={idx} className="flex gap-3 text-[11px] leading-relaxed text-slate-500">
                              <span className="text-neon mt-1">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <section className="pt-4 border-t border-white/5">
                      <div className="flex gap-3">
                        <a 
                          href={`https://www.google.com/search?q=${selectedCommand.library}+${selectedCommand.title}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all uppercase tracking-widest"
                        >
                          Documentation Search <ExternalLink size={12} />
                        </a>
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 glass-panel rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-white/[0.02] border border-white/5 flex items-center justify-center rounded-[2rem] mb-6 shadow-inner">
                  <Info size={32} className="text-slate-700" />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Inspector Idle</h3>
                <p className="text-xs text-slate-600 max-w-[200px] leading-relaxed">Select a command module from the terminal to initiate technical inspection.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      <footer className="mt-20 py-12 border-t border-black/5 text-center">
        <p className="text-xs text-muted leading-relaxed max-w-2xl mx-auto">
          所有指令数据都内置在本地脚本中，不依赖后端或外部字体；在离线环境下也可以正常检索。
          <br />需要联网时，你还可以从详情里的官方参考继续查看原始文档。
        </p>
      </footer>
    </div>
  );
}
