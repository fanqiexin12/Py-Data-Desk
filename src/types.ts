export interface LibraryMeta {
  label: string;
  note: string;
}

export interface CategoryMeta {
  label: string;
}

export interface QuickFilter {
  label: string;
  library: string;
  category: string;
  search: string;
}

export interface Scenario {
  id: string;
  title: string;
  summary: string;
  library: string;
  category: string;
  search: string;
  leadId: string;
  steps: string[];
  highlights: string[];
}

export interface Parameter {
  name: string;
  meaning: string;
  detail: string;
}

export interface Example {
  title: string;
  code: string;
  note: string;
}

export interface OfficialRef {
  label: string;
  url: string;
  source: string;
  note: string;
  kind?: string;
}

export interface Command {
  id: string;
  library: string;
  category: string;
  title: string;
  alias: string;
  summary: string;
  syntax: string;
  code: string;
  keywords: string[];
  tips: string[];
  related: string[];
  when: string;
  searchBlob?: string;
  parameters?: Parameter[];
  examples?: Example[];
  officialReferences?: OfficialRef[];
  professionalDetail?: string;
  recommendedUse?: string[];
  visualDemo?: {
    type: string;
    title: string;
    note: string;
  };
}
