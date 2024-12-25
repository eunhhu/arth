import React from 'react';
import { cvt } from '../../util/styler';

interface ISvg extends React.SVGProps<SVGSVGElement> {
    href: string;
    fill: string;
    xmlns?: string;
    width?: string;
    height?: string;
}

const Svg = ({ href, fill = "currentColor", xmlns = 'http://www.w3.org/2000/svg', width, height, ...props }: ISvg) => {
    return <svg xmlns={xmlns} width={width} height={height} {...props} fill={cvt(fill)}>
        <use href={href} />
    </svg>
}

export default Svg;