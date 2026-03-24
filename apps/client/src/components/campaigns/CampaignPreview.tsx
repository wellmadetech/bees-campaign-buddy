import { useState } from 'react';
import { Smartphone, Monitor, Mail, X } from 'lucide-react';

interface Props {
  headline?: string;
  body?: string;
  cta?: string;
  subject?: string;
  imageUrl?: string;
  channel?: 'push' | 'email' | 'in_app';
  open: boolean;
  onClose: () => void;
}

export function CampaignPreview({ headline, body, cta, subject, imageUrl, channel = 'push', open, onClose }: Props) {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h3 className="text-[15px] font-semibold text-surface-900">Campaign Preview</h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-100 rounded-lg p-0.5">
              <button
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-surface-900' : 'text-surface-400'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-surface-900' : 'text-surface-400'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-8 bg-surface-100 flex justify-center min-h-[500px]">
          {/* Push notification preview */}
          {channel === 'push' && device === 'mobile' && (
            <div className="w-[320px]">
              {/* Phone frame */}
              <div className="bg-surface-900 rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-surface-800 rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-2 text-white/60 text-[10px]">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-white/40 rounded-sm" />
                      <div className="w-4 h-2 bg-white/40 rounded-sm" />
                    </div>
                  </div>
                  {/* Lock screen */}
                  <div className="px-4 pt-8 pb-6">
                    <div className="text-center text-white mb-12">
                      <div className="text-4xl font-light tabular-nums">9:41</div>
                      <div className="text-xs text-white/50 mt-1">Tuesday, March 24</div>
                    </div>
                    {/* Push notification card */}
                    <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-3.5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">B</span>
                        </div>
                        <span className="text-[10px] text-white/60 font-medium">BEES</span>
                        <span className="text-[10px] text-white/40 ml-auto">now</span>
                      </div>
                      {headline && <div className="text-[13px] font-semibold text-white mb-0.5">{headline}</div>}
                      {body && <div className="text-[11px] text-white/70 leading-relaxed line-clamp-3">{body}</div>}
                      {imageUrl && <div className="mt-2 h-24 bg-white/10 rounded-lg overflow-hidden"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                    </div>
                  </div>
                  <div className="h-20" />
                </div>
              </div>
            </div>
          )}

          {/* Email preview */}
          {(channel === 'email' || (channel === 'push' && device === 'desktop')) && (
            <div className={device === 'mobile' ? 'w-[320px]' : 'w-full max-w-[560px]'}>
              <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${device === 'mobile' ? '' : ''}`}>
                {/* Email header */}
                <div className="bg-surface-50 px-5 py-3 border-b border-surface-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-surface-400" />
                    <span className="text-[11px] text-surface-400">From: BEES Campaign Buddy</span>
                  </div>
                  {subject && (
                    <div className="text-sm font-semibold text-surface-900">{subject || headline}</div>
                  )}
                  {!subject && headline && (
                    <div className="text-sm font-semibold text-surface-900">{headline}</div>
                  )}
                </div>
                {/* Email body */}
                <div className="p-6">
                  {imageUrl && (
                    <div className="h-40 bg-surface-100 rounded-lg overflow-hidden mb-5">
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {headline && <h1 className="text-xl font-bold text-surface-900 mb-3">{headline}</h1>}
                  {body && <p className="text-sm text-surface-600 leading-relaxed mb-5">{body}</p>}
                  {cta && (
                    <div className="text-center">
                      <span className="inline-block px-6 py-3 bg-brand-500 text-white text-sm font-semibold rounded-lg">
                        {cta}
                      </span>
                    </div>
                  )}
                  {/* Footer */}
                  <div className="mt-8 pt-4 border-t border-surface-100 text-center">
                    <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-[10px] font-bold">B</span>
                    </div>
                    <p className="text-[10px] text-surface-400">BEES One Digital Communications</p>
                    <p className="text-[10px] text-surface-300 mt-0.5">You're receiving this because you're a BEES retailer.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* In-app preview */}
          {channel === 'in_app' && (
            <div className="w-[320px]">
              <div className="bg-surface-900 rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-2 text-surface-400 text-[10px]">
                    <span>9:41</span>
                    <div className="flex gap-1"><div className="w-4 h-2 bg-surface-300 rounded-sm" /><div className="w-4 h-2 bg-surface-300 rounded-sm" /></div>
                  </div>
                  {/* App content behind */}
                  <div className="px-4 py-3 opacity-30">
                    <div className="h-3 w-20 bg-surface-200 rounded mb-2" />
                    <div className="h-2 w-full bg-surface-100 rounded mb-1" />
                    <div className="h-2 w-3/4 bg-surface-100 rounded mb-4" />
                    <div className="h-20 bg-surface-100 rounded-lg" />
                  </div>
                  {/* Modal overlay */}
                  <div className="absolute inset-x-3 bottom-3 bg-black/30 top-[60px] rounded-b-[2rem] flex items-end justify-center pb-6">
                    <div className="bg-white rounded-2xl p-5 mx-4 w-full shadow-xl">
                      {imageUrl && <div className="h-24 bg-surface-100 rounded-lg overflow-hidden mb-3"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                      {headline && <div className="text-[15px] font-bold text-surface-900 mb-1.5 text-center">{headline}</div>}
                      {body && <div className="text-xs text-surface-500 text-center leading-relaxed mb-4">{body}</div>}
                      {cta && <div className="bg-brand-500 text-white text-sm font-semibold py-2.5 rounded-lg text-center">{cta}</div>}
                      <div className="text-[10px] text-surface-400 text-center mt-2">Dismiss</div>
                    </div>
                  </div>
                  <div className="h-48" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-surface-100 flex items-center justify-between">
          <span className="text-[11px] text-surface-400">This is a preview — actual rendering may vary by device</span>
          <button onClick={onClose} className="btn-secondary text-xs">Close Preview</button>
        </div>
      </div>
    </div>
  );
}
