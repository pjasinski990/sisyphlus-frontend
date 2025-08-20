import '../style/wavy.css';
import React, { useMemo } from 'react';

type Props = {
    text: string;
    byLetter?: boolean;
    className?: string;
    amp?: string;          // wave amplitude, e.g. "0.35em"
    period?: string;       // wave period, e.g. "1.1s"
    stagger?: string;      // inter-letter delay, e.g. "0.06s"
    shakeMax?: string;     // max shake amplitude, e.g. "0.08em"
    shakeMin?: string;     // min shake amplitude, e.g. "0.03em"
    shakePeriodMin?: string; // e.g. "0.12s"
    shakePeriodMax?: string; // e.g. "0.22s"
};

export const WavyText: React.FC<Props> = ({
    text,
    className,
    byLetter = true,
    amp = '0.20em',
    period = '1.1s',
    stagger = '0.06s',
    shakeMax = '0.09em',
    shakeMin = '0.07em',
    shakePeriodMin = '0.12s',
    shakePeriodMax = '0.22s',
}) => {
    const seeds = useMemo(() => {
        const toMs = (v: string) => (v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000);
        const minAmp = parseFloat(shakeMin);
        const maxAmp = parseFloat(shakeMax);
        const minP = toMs(shakePeriodMin);
        const maxP = toMs(shakePeriodMax);

        return [...text].map((_, i) => {
            const r = Math.sin(i * 12.9898) * 43758.5453;
            const frac = r - Math.floor(r);

            const amp = (minAmp + frac * (maxAmp - minAmp)).toFixed(4) + 'em';
            const periodMs = Math.round(minP + (1 - frac) * (maxP - minP));
            const delayMs = Math.round(frac * 100);

            return { amp, period: `${periodMs}ms`, delay: `${delayMs}ms` };
        });
    }, [text, shakeMax, shakeMin, shakePeriodMin, shakePeriodMax]);

    return (
        <span
            className={`wavy ${className ?? ''}`}
            style={
                {
                    ['--wave-amp' as any]: amp,
                    ['--wave-period' as any]: period,
                    ['--wave-stagger' as any]: stagger,
                } as React.CSSProperties
            }
            aria-label={text}
        >
            {[...text].map((ch, i) => (
                <span key={i} className='wavy-w' style={{ ['--i' as any]: i }}>
                    <span
                        className='wavy-s'
                        style={
                            {
                                ['--shake-amp' as any]: seeds[i].amp,
                                ['--shake-period' as any]: seeds[i].period,
                                ['--shake-delay' as any]: seeds[i].delay,
                            } as React.CSSProperties
                        }
                    >
                        {ch === ' ' ? '\u00A0' : ch}
                    </span>
                </span>
            ))}
        </span>
    );
};
