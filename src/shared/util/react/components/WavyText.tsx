import '../style/wavy.css';
import React, { useMemo } from 'react';

type Props = {
    text: string;
    byLetter?: boolean;
    className?: string;
    amp?: string;
    period?: string;
    stagger?: string;
    shakeMax?: string;
    shakeMin?: string;
    shakePeriodMin?: string;
    shakePeriodMax?: string;
};

type Unit = { text: string; isSpace: boolean };

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
    const units: Unit[] = useMemo(() => {
        if (byLetter) {
            return [...text].map(ch => ({ text: ch, isSpace: ch === ' ' }));
        }
        const parts = text.split(/(\s+)/);
        return parts.map(p => ({ text: p, isSpace: /^\s+$/.test(p) }));
    }, [text, byLetter]);

    const seeds = useMemo(() => {
        const toMs = (v: string) => (v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000);
        const minAmp = parseFloat(shakeMin);
        const maxAmp = parseFloat(shakeMax);
        const minP = toMs(shakePeriodMin);
        const maxP = toMs(shakePeriodMax);

        const animatedCount = units.filter(u => !u.isSpace).length;

        return Array.from({ length: animatedCount }, (_, i) => {
            const r = Math.sin(i * 12.9898) * 43758.5453;
            const frac = r - Math.floor(r);
            const ampVal = (minAmp + frac * (maxAmp - minAmp)).toFixed(4) + 'em';
            const periodMs = Math.round(minP + (1 - frac) * (maxP - minP));
            const delayMs = Math.round(frac * 100);
            return { amp: ampVal, period: `${periodMs}ms`, delay: `${delayMs}ms` };
        });
    }, [units, shakeMax, shakeMin, shakePeriodMin, shakePeriodMax]);

    let animatedIndex = 0;

    return (
        <span
            className={`wavy ${className ?? ''}`}
            style={
                {
                    ['--wave-amp']: amp,
                    ['--wave-period']: period,
                    ['--wave-stagger']: stagger,
                } as React.CSSProperties
            }
            aria-label={text}
        >
            {units.map((u, i) => {
                if (u.isSpace) {
                    const nbsp = u.text.replace(/ /g, '\u00A0');
                    return <span key={i} aria-hidden='true'>{nbsp}</span>;
                }

                const seed = seeds[animatedIndex];
                const currentIndex = animatedIndex;
                animatedIndex += 1;

                return (
                    <span
                        key={i}
                        className={`wavy-w ${byLetter ? '' : 'simple'}`}
                        style={{ ['--i']: currentIndex } as React.CSSProperties}
                    >
                        <span
                            className='wavy-s'
                            style={
                                {
                                    ['--shake-amp']: seed.amp,
                                    ['--shake-period']: seed.period,
                                    ['--shake-delay']: seed.delay,
                                } as React.CSSProperties
                            }
                        >
                            {u.text}
                        </span>
                    </span>
                );
            })}
        </span>
    );
};
