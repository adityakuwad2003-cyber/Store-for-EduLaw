export interface SectionMapping {
  oldAct:     string;
  newAct:     string;
  oldSection: string;
  newSection: string;
  topic:      string;
}

export const SECTION_MAPPINGS: SectionMapping[] = [
  // ── IPC → BNS ──────────────────────────────────────────────────────────────
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '300',  newSection: '100',  topic: 'Murder (definition)'             },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '302',  newSection: '101',  topic: 'Punishment for murder'           },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '304B', newSection: '80',   topic: 'Dowry death'                     },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '307',  newSection: '109',  topic: 'Attempt to murder'               },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '309',  newSection: '226',  topic: 'Attempt to commit suicide'       },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '354',  newSection: '74',   topic: 'Assault / outraging modesty'     },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '376',  newSection: '63',   topic: 'Rape'                            },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '379',  newSection: '303',  topic: 'Theft'                           },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '392',  newSection: '309',  topic: 'Robbery'                         },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '395',  newSection: '310',  topic: 'Dacoity'                         },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '420',  newSection: '318',  topic: 'Cheating'                        },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '498A', newSection: '85',   topic: 'Cruelty to wife'                 },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '120B', newSection: '61',   topic: 'Criminal conspiracy'             },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '124A', newSection: '152',  topic: 'Sedition / endangering sovereignty' },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '153A', newSection: '196',  topic: 'Promoting enmity between groups' },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '294',  newSection: '294',  topic: 'Obscene acts in public'          },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '323',  newSection: '115',  topic: 'Voluntarily causing hurt'        },
  { oldAct: 'IPC', newAct: 'BNS', oldSection: '406',  newSection: '316',  topic: 'Criminal breach of trust'        },
  // ── CrPC → BNSS ────────────────────────────────────────────────────────────
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '41',  newSection: '35',  topic: 'Arrest without warrant'          },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '46',  newSection: '43',  topic: 'How arrest is made'              },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '154', newSection: '173', topic: 'FIR registration'                },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '161', newSection: '180', topic: 'Police examination of witnesses' },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '164', newSection: '183', topic: 'Confessions / statements to Magistrate' },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '167', newSection: '187', topic: 'Remand / custody order'          },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '173', newSection: '193', topic: 'Police report (chargesheet)'     },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '197', newSection: '218', topic: 'Prosecution of public servants'  },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '309', newSection: '346', topic: 'Postponement / adjournment'      },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '374', newSection: '415', topic: 'Appeal from conviction'          },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '438', newSection: '482', topic: 'Anticipatory bail'               },
  { oldAct: 'CrPC', newAct: 'BNSS', oldSection: '482', newSection: '528', topic: 'Inherent powers of High Court'   },
  // ── IEA → BSA ──────────────────────────────────────────────────────────────
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '3',   newSection: '2',   topic: 'Definitions (fact, evidence, etc.)' },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '17',  newSection: '15',  topic: 'Admission defined'                  },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '24',  newSection: '22',  topic: 'Confession caused by inducement'    },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '25',  newSection: '23',  topic: 'Confession to police officer'       },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '27',  newSection: '23',  topic: 'Disclosure by accused in custody'   },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '45',  newSection: '39',  topic: 'Expert opinion'                     },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '65B', newSection: '63',  topic: 'Admissibility of electronic records' },
  { oldAct: 'IEA', newAct: 'BSA', oldSection: '114', newSection: '119', topic: 'Presumptions of fact'               },
];

// Acts for which the bridge section should be shown
export const BRIDGE_ACT_IDS = new Set(['ipc', 'bns', 'crpc', 'bnss', 'iea', 'bsa']);

// Map actId to the "old" act label for display
const ACT_OLD_LABEL: Record<string, string> = {
  ipc: 'IPC', bns: 'IPC', crpc: 'CrPC', bnss: 'CrPC', iea: 'IEA', bsa: 'IEA',
};

// Map actId to the "new" act label for display
export const ACT_NEW_LABEL: Record<string, string> = {
  ipc: 'BNS', bns: 'BNS', crpc: 'BNSS', bnss: 'BNSS', iea: 'BSA', bsa: 'BSA',
};

/**
 * Returns mappings relevant to the given act + query.
 * If a section number is detected in query, returns only that row (plus its pair).
 * Otherwise returns up to 6 mappings for the act.
 */
export function getBridgeMappings(actId: string, query: string): SectionMapping[] {
  const oldActLabel = ACT_OLD_LABEL[actId];
  if (!oldActLabel) return [];

  const relevant = SECTION_MAPPINGS.filter(m => m.oldAct === oldActLabel);

  // Try to match query to a specific section number (e.g. "302", "65B", "498A")
  const sectionNum = query.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  if (sectionNum) {
    const exact = relevant.filter(
      m => m.oldSection.toUpperCase() === sectionNum || m.newSection.toUpperCase() === sectionNum,
    );
    if (exact.length > 0) {
      // Return exact match + up to 4 surrounding entries for context
      const idx = relevant.indexOf(exact[0]);
      const start = Math.max(0, idx - 2);
      const end   = Math.min(relevant.length, start + 6);
      return relevant.slice(start, end);
    }
  }

  // keyword/citation mode or no match — return first 6 for the act
  return relevant.slice(0, 6);
}
