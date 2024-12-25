import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { cvt } from '../../util/styler';

interface IPaddingMarginMixin {
    $padding?: string;
    $margin?: string;
}

const paddingMarginMixin = css<IPaddingMarginMixin>`
    padding: ${p => cvt(p.$padding || '0')};
    margin: ${p => cvt(p.$margin || '0')};
`;

interface ISizeMixin {
    $width?: string;
    $height?: string;
}

const sizeMixin = css<ISizeMixin>`
    width: ${p => cvt(p.$width || 'auto')};
    height: ${p => cvt(p.$height || 'auto')};
`;

interface ICommonStyleMixin {
    $color?: string;
    $size?: string;
    $weight?: string;
    $background?: string;
    $border?: string;
    $rounded?: string;
}

const commonStyleMixin = css<ICommonStyleMixin>`
    color: ${p => cvt(p.$color || 'inherit')};
    font-size: ${p => cvt(p.$size || 'var(--body)')};
    font-weight: ${p => cvt(p.$weight || '400')};
    background-color: ${p => cvt(p.$background || 'transparent')};
    border: ${p => cvt(p.$border || 'none')};
    border-radius: ${p => cvt(p.$rounded || '0')};
`;

interface IFlexMixin {
    $justify?: string;
    $items?: string;
    $wrap?: string;
    $gap?: string;
}

const flexMixin = css<IFlexMixin>`
    display: flex;
    justify-content: ${p => cvt(p.$justify || 'center')};
    align-items: ${p => cvt(p.$items || 'center')};
    flex-wrap: ${p => p.$wrap || 'nowrap'};
    gap: ${p => cvt(p.$gap || '0')};
`;

const Div = styled(motion.div)<IPaddingMarginMixin>`
    ${paddingMarginMixin}
`;

const Link = styled(motion.a)<IPaddingMarginMixin & ISizeMixin>`
    ${paddingMarginMixin}
    ${sizeMixin}
    text-decoration: none;
`;

const Button = styled(motion.button)<IPaddingMarginMixin & ISizeMixin & ICommonStyleMixin>`
    ${paddingMarginMixin}
    ${sizeMixin}
    ${commonStyleMixin}
    cursor: pointer;
    outline: none;
    text-align: center;
`;

const Input = styled(motion.input)<{
    $center?: boolean;
} & IPaddingMarginMixin & ISizeMixin & ICommonStyleMixin>`
    ${paddingMarginMixin}
    ${sizeMixin}
    ${commonStyleMixin}
    outline: none;
    text-align: ${p => (p.$center ? 'center' : 'left')};
`;

const Box = styled(Div)<ISizeMixin & ICommonStyleMixin>`
    ${sizeMixin}
    ${commonStyleMixin}
`;

const Image = styled(motion.img)<{
    $rounded?: string;
} & ISizeMixin>`
    ${sizeMixin}
    border-radius: ${p => cvt(p.$rounded || '0')};
`;

const Video = styled(motion.video)<{
    $rounded?: string;
} & ISizeMixin>`
    ${sizeMixin}
    border-radius: ${p => cvt(p.$rounded || '0')};
`;

const Flex = styled(Div)<{
    $background?: string;
} & IFlexMixin>`
    ${flexMixin}
    width: 100%;
    background-color: ${p => cvt(p.$background || 'transparent')};
`;

const Row = styled(Flex)<{
    $reverse?: boolean;
}>`
    flex-direction: ${p => (p.$reverse ? 'row-reverse' : 'row')};
`;

const Column = styled(Flex)<{
    $reverse?: boolean;
}>`
    flex-direction: ${p => (p.$reverse ? 'column-reverse' : 'column')};
`;

const Container = styled(Div)<{
    $center?: boolean;
    $background?: string;
    $scroll?: boolean;
}>`
    display: flex;
    flex-direction: column;
    justify-content: ${p => (p.$center ? 'center' : 'flex-start')};
    align-items: ${p => (p.$center ? 'center' : 'flex-start')};
    background-color: ${p => cvt(p.$background || 'transparent')};
    overflow: ${p => (p.$scroll ? 'auto' : 'hidden')};
    width: 100%;
    height: 100%;
`;

const Overlay = styled(Container)<{
    $color?: string;
    $opacity?: number;
}>`
    position: absolute;
    top: 0;
    left: 0;
    background-color: ${p => cvt(p.$color || 'rgba(0, 0, 0, 0.5)')};
    opacity: ${p => cvt(p.$opacity || 1)};
`;

const Float = styled(Div)<{
    $position?: string;
    $distance?: string;
}>`
    position: fixed;
    top: ${p =>
        ['top', 'top-right', 'top-left'].includes(p.$position || '')
            ? cvt(p.$distance || '0')
            : p.$position === 'center'
            ? '50%'
            : 'auto'};
    right: ${p =>
        ['right', 'top-right', 'bottom-right'].includes(p.$position || '')
            ? cvt(p.$distance || '0')
            : 'auto'};
    bottom: ${p =>
        ['bottom', 'bottom-right', 'bottom-left'].includes(p.$position || '')
            ? cvt(p.$distance || '0')
            : 'auto'};
    left: ${p =>
        ['left', 'top-left', 'bottom-left'].includes(p.$position || '')
            ? cvt(p.$distance || '0')
            : p.$position === 'center'
            ? '50%'
            : 'auto'};
    transform: ${p => (p.$position === 'center' ? 'translate(-50%, -50%)' : 'none')};
`;

const Text = styled(Div)<{
    $size?: string;
    $weight?: string;
    $color?: string;
    $align?: 'left' | 'right' | 'center';
    $transform?: 'uppercase' | 'lowercase' | 'capitalize';
}>`
    font-size: ${p => cvt(p.$size || 'var(--body)')};
    font-weight: ${p => cvt(p.$weight || '400')};
    color: ${p => cvt(p.$color || 'var(--content)')};
    text-align: ${p => p.$align || 'left'};
    text-transform: ${p => p.$transform || 'none'};
`;

export {
    Div,
    Link,
    Button,
    Input,
    Box,
    Image,
    Video,
    Flex,
    Row,
    Column,
    Container,
    Overlay,
    Float,
    Text,
};
