import React, { useState } from 'react';

interface VirtualKeyboardProps {
  language: 'hindi' | 'english';
  script: 'remington_gail' | 'inscript' | 'english';
  activeKey?: string;
  theme?: 'dark' | 'light';
}

const REMINGTON_GAIL_MAP: Record<string, { normal: string; shift: string }> = {
  '`': { normal: '`', shift: '~' },
  '1': { normal: '1', shift: '!' },
  '2': { normal: '2', shift: '@' },
  '3': { normal: '3', shift: '#' },
  '4': { normal: '4', shift: '+' },
  '5': { normal: '5', shift: '%' },
  '6': { normal: '6', shift: '”' },
  '7': { normal: '7', shift: '’' },
  '8': { normal: '8', shift: 'सं' },
  '9': { normal: '9', shift: '(' },
  '0': { normal: '0', shift: ')' },
  '-': { normal: '-', shift: 'ऋ' },
  '=': { normal: 'ृ', shift: '्' },

  'q': { normal: 'ु', shift: 'ू' },
  'w': { normal: 'ू', shift: 'ॅ' },
  'e': { normal: 'म', shift: 'म्' },
  'r': { normal: 'त', shift: 'त्' },
  't': { normal: 'ज', shift: 'ज्' },
  'y': { normal: 'ल', shift: 'ल्' },
  'u': { normal: 'न', shift: 'न्' },
  'i': { normal: 'प', shift: 'प्' },
  'o': { normal: 'व', shift: 'व्' },
  'p': { normal: 'च', shift: 'च्' },
  '[': { normal: 'ख्', shift: 'क्ष' },
  ']': { normal: ',', shift: 'द्व' },

  'a': { normal: 'ं', shift: 'ँ' },
  's': { normal: 'े', shift: 'ै' },
  'd': { normal: 'क', shift: 'क्' },
  'f': { normal: 'ि', shift: 'थ्' },
  'g': { normal: 'ह', shift: 'भ्' },
  'h': { normal: 'ी', shift: 'भ' },
  'j': { normal: 'र', shift: 'श्र' },
  'k': { normal: 'ा', shift: 'ज्ञ' },
  'l': { normal: 'स', shift: 'स्' },
  ';': { normal: 'य', shift: 'श्' },
  "'": { normal: 'श', shift: 'ष्' },

  'z': { normal: '्र', shift: 'र्' },
  'x': { normal: 'ग', shift: 'ग्' },
  'c': { normal: 'ब', shift: 'ब्' },
  'v': { normal: 'अ', shift: 'ट' },
  'b': { normal: 'इ', shift: 'ठ' },
  'n': { normal: 'द', shift: 'छ' },
  'm': { normal: 'उ', shift: 'ड' },
  ',': { normal: 'ए', shift: 'ढ' },
  '.': { normal: 'ण्', shift: 'झ' },
  '/': { normal: 'ध', shift: 'ध्र' },
};

const INSCRIPT_MAP: Record<string, { normal: string; shift: string }> = {
  '1': { normal: '१', shift: 'ऍ' },
  '2': { normal: '२', shift: 'र्' },
  '3': { normal: '३', shift: '्र' },
  '4': { normal: '४', shift: 'र्' },
  '5': { normal: '५', shift: 'ज्ञ' },
  '6': { normal: '६', shift: 'त्र' },
  '7': { normal: '७', shift: 'क्ष' },
  '8': { normal: '८', shift: 'श्र' },
  '9': { normal: '९', shift: '(' },
  '0': { normal: '०', shift: ')' },

  'q': { normal: 'ौ', shift: 'औ' },
  'w': { normal: 'ै', shift: 'ऐ' },
  'e': { normal: 'ा', shift: 'आ' },
  'r': { normal: 'ी', shift: 'ई' },
  't': { normal: 'ू', shift: 'ऊ' },
  'y': { normal: 'ब', shift: 'भ' },
  'u': { normal: 'ह', shift: 'ङ' },
  'i': { normal: 'ग', shift: 'घ' },
  'o': { normal: 'द', shift: 'ध' },
  'p': { normal: 'ज', shift: 'झ' },

  'a': { normal: 'ो', shift: 'ओ' },
  's': { normal: 'े', shift: 'ए' },
  'd': { normal: '्', shift: 'अ' },
  'f': { normal: 'ि', shift: 'इ' },
  'g': { normal: 'ु', shift: 'उ' },
  'h': { normal: 'प', shift: 'फ' },
  'j': { normal: 'र', shift: 'ऱ' },
  'k': { normal: 'क', shift: 'ख' },
  'l': { normal: 'त', shift: 'थ' },
  ';': { normal: 'च', shift: 'छ' },
  "'": { normal: 'ट', shift: 'ठ' },

  'z': { normal: 'ं', shift: 'ँ' },
  'x': { normal: 'ं', shift: 'ः' },
  'c': { normal: 'म', shift: 'ण' },
  'v': { normal: 'न', shift: 'न' },
  'b': { normal: 'व', shift: 'ऒ' },
  'n': { normal: 'ल', shift: 'ळ' },
  'm': { normal: 'स', shift: 'श' },
  ',': { normal: ',', shift: 'ष' },
  '.': { normal: '.', shift: '।' },
};

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  language,
  script,
  activeKey,
  theme = 'dark',
}) => {
  const [shiftPressed, setShiftPressed] = useState(false);

  const isDark = theme === 'dark';
  const isHindi = language === 'hindi';
  const mapping = script === 'remington_gail' ? REMINGTON_GAIL_MAP : INSCRIPT_MAP;

  return (
    <div
      className={`rounded-xl p-4 border transition-colors ${
        isDark
          ? 'bg-[#0a101f] border-[#162544] text-slate-100 shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {isHindi ? `Hindi Key Layout: ${script === 'remington_gail' ? 'Remington Gail (Mangal)' : 'Inscript'}` : 'Physical Keyboard Reference'}
          </span>
          <span className="text-slate-500 text-[11px]">
            {isHindi ? 'Official CPCT Test Layout' : 'QWERTY'}
          </span>
        </div>

        {isHindi && (
          <button
            type="button"
            onClick={() => setShiftPressed(!shiftPressed)}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              shiftPressed
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-[#060a14] border border-[#162544] text-slate-300 hover:bg-[#0c1427]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Shift: {shiftPressed ? 'ACTIVE' : 'OFF'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 select-none font-mono text-sm max-w-4xl mx-auto">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 justify-center">
            {rIdx === 1 && (
              <div
                className={`w-10 text-[10px] rounded flex items-center justify-center font-sans ${
                  isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Tab
              </div>
            )}
            {rIdx === 2 && (
              <div
                className={`w-12 text-[10px] rounded flex items-center justify-center font-sans ${
                  isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Caps
              </div>
            )}
            {rIdx === 3 && (
              <button
                type="button"
                onClick={() => setShiftPressed(!shiftPressed)}
                className={`w-14 text-[10px] rounded flex items-center justify-center font-sans font-semibold transition-colors ${
                  shiftPressed
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-[#060a14] border border-[#162544] text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Shift
              </button>
            )}

            {row.map((key) => {
              const lowerKey = key.toLowerCase();
              const isPressed = activeKey && activeKey.toLowerCase() === lowerKey;
              const mapped = isHindi ? mapping[lowerKey] : null;

              return (
                <div
                  key={key}
                  className={`relative flex flex-col items-center justify-between w-8 sm:w-10 h-10 p-1 rounded border transition-all ${
                    isPressed
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-95 shadow-blue-500/40'
                      : isDark
                      ? 'bg-[#0c1427] border-[#162544] text-slate-200 hover:border-blue-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`text-[9px] self-start font-sans leading-none opacity-50 ${
                      isPressed ? 'text-white' : ''
                    }`}
                  >
                    {key.toUpperCase()}
                  </span>

                  <span
                    className={`font-semibold leading-none ${
                      isHindi ? 'text-sm font-hindi' : 'text-xs'
                    } ${
                      isPressed
                        ? 'text-white'
                        : isHindi
                        ? 'text-blue-400 dark:text-blue-300'
                        : isDark
                        ? 'text-slate-200'
                        : 'text-slate-900'
                    }`}
                  >
                    {isHindi && mapped
                      ? shiftPressed
                        ? mapped.shift
                        : mapped.normal
                      : key}
                  </span>
                </div>
              );
            })}

            {rIdx === 0 && (
              <div
                className={`w-14 text-[10px] rounded flex items-center justify-center font-sans ${
                  isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Backspace
              </div>
            )}
            {rIdx === 2 && (
              <div
                className={`w-14 text-[10px] rounded flex items-center justify-center font-sans ${
                  isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Enter
              </div>
            )}
          </div>
        ))}

        {/* Space Bar Row */}
        <div className="flex gap-1 justify-center mt-0.5">
          <div
            className={`w-12 text-[10px] rounded flex items-center justify-center font-sans ${
              isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}
          >
            Ctrl
          </div>
          <div
            className={`w-10 text-[10px] rounded flex items-center justify-center font-sans ${
              isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}
          >
            Alt
          </div>
          <div
            className={`w-64 h-8 rounded border flex items-center justify-center text-xs transition-colors ${
              activeKey === ' '
                ? 'bg-blue-600 text-white font-semibold border-blue-400 shadow-md shadow-blue-500/40'
                : isDark
                ? 'bg-[#0c1427] border-[#162544] text-slate-400 hover:border-blue-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            Space Bar
          </div>
          <div
            className={`w-10 text-[10px] rounded flex items-center justify-center font-sans ${
              isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}
          >
            Alt
          </div>
          <div
            className={`w-12 text-[10px] rounded flex items-center justify-center font-sans ${
              isDark ? 'bg-[#060a14] border border-[#162544] text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}
          >
            Ctrl
          </div>
        </div>
      </div>
    </div>
  );
};
