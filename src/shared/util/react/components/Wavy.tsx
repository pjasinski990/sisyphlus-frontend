import '../style/wavy.css';
import React, { useMemo } from 'react';

type WavyProps = {
    children: React.ReactNode;
    className?: string;
    tilt?: string;
    amp?: string;
    period?: string;
    stagger?: string;
    shakeMax?: string;
    shakeMin?: string;
    shakePeriodMin?: string;
    shakePeriodMax?: string;
};

export const Wavy: React.FC<WavyProps> = ({
    children,
    className,
    tilt=false,
    amp = '0.20em',
    period = '1.1s',
    stagger = '0.06s',
    shakeMax = '0.09em',
    shakeMin = '0.07em',
    shakePeriodMin = '0.12s',
    shakePeriodMax = '0.22s',
}) => {
    const count = React.Children.count(children);

    const seeds = useMemo(() => {
        const toMs = (v: string) => (v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000);
        const minAmp = parseFloat(shakeMin);
        const maxAmp = parseFloat(shakeMax);
        const minP = toMs(shakePeriodMin);
        const maxP = toMs(shakePeriodMax);

        return Array.from({ length: Math.max(1, count) }, (_, i) => {
            const r = Math.sin(i * 12.9898) * 43758.5453;
            const frac = r - Math.floor(r);
            const a = (minAmp + frac * (maxAmp - minAmp)).toFixed(4) + 'em';
            const periodMs = Math.round(minP + (1 - frac) * (maxP - minP));
            const delayMs = Math.round(frac * 100);
            return { amp: a, period: `${periodMs}ms`, delay: `${delayMs}ms` };
        });
    }, [count, shakeMax, shakeMin, shakePeriodMin, shakePeriodMax]);

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
        >
            {React.Children.map(children, (child, i) => (
                <span key={i} className={`wavy-w ${tilt ? '' : 'simple'}`} style={{ ['--i']: i } as React.CSSProperties}>
                    <span
                        className='wavy-s'
                        style={
                            {
                                ['--shake-amp']: seeds[i % seeds.length].amp,
                                ['--shake-period']: seeds[i % seeds.length].period,
                                ['--shake-delay']: seeds[i % seeds.length].delay,
                            } as React.CSSProperties
                        }
                    >
                        {child}
                    </span>
                </span>
            ))}
        </span>
    );
};
