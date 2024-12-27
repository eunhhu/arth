import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { cvt } from '../../util/styler';

interface IPaddingMarginMixin {
    $padding?: string;
    $margin?: string;
    $pt?: string;
    $pr?: string;
    $pb?: string;
    $pl?: string;
    $mt?: string;
    $mr?: string;
    $mb?: string;
    $ml?: string;
}

const paddingMarginMixin = css<IPaddingMarginMixin>`
    padding: ${p => cvt(p.$padding || '')};
    margin: ${p => cvt(p.$margin || '')};
    padding-top: ${p => cvt(p.$pt || '')};
    padding-right: ${p => cvt(p.$pr || '')};
    padding-bottom: ${p => cvt(p.$pb || '')};
    padding-left: ${p => cvt(p.$pl || '')};
    margin-top: ${p => cvt(p.$mt || '')};
    margin-right: ${p => cvt(p.$mr || '')};
    margin-bottom: ${p => cvt(p.$mb || '')};
    margin-left: ${p => cvt(p.$ml || '')};
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
    $bt?: string;
    $br?: string;
    $bb?: string;
    $bl?: string;
    $rounded?: string;
}

const commonStyleMixin = css<ICommonStyleMixin>`
    color: ${p => cvt(p.$color || 'content')};
    font-size: ${p => cvt(p.$size || 'body')};
    font-weight: ${p => cvt(p.$weight || '400')};
    background-color: ${p => cvt(p.$background || 'transparent')};
    border: ${p => cvt(p.$border || 'none')};
    border-top: ${p => cvt(p.$bt || '')};
    border-right: ${p => cvt(p.$br || '')};
    border-bottom: ${p => cvt(p.$bb || '')};
    border-left: ${p => cvt(p.$bl || '')};
    border-radius: ${p => cvt(p.$rounded || '')};
`;

interface IFlexMixin {
    $justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | string;
    $items?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch" | string;
    $wrap?: "nowrap" | "wrap" | "wrap-reverse" | string;
    $gap?: string;
}

const flexMixin = css<IFlexMixin>`
    display: flex;
    justify-content: ${p => cvt(p.$justify || 'center')};
    align-items: ${p => cvt(p.$items || 'center')};
    flex-wrap: ${p => p.$wrap || ''};
    gap: ${p => cvt(p.$gap || '')};
`;

const Div = styled(motion.div)<{
    $absolute?: boolean;
    $relative?: boolean;
    $color?: string;
} & IPaddingMarginMixin>`
    ${paddingMarginMixin}
    position: ${p => (p.$absolute ? 'absolute' : p.$relative ? 'relative' : '')};
    color: ${p => cvt(p.$color || 'content')};
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

const Select = styled(motion.select)<{
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
    border-radius: ${p => cvt(p.$rounded || '')};
`;

const Video = styled(motion.video)<{
    $rounded?: string;
} & ISizeMixin>`
    ${sizeMixin}
    border-radius: ${p => cvt(p.$rounded || '')};
`;

const Flex = styled(Div)<{
    $background?: string;
    $direction?: 'row' | 'column';
} & IFlexMixin & ISizeMixin>`
    ${flexMixin}
    width: ${p => cvt(p.$width || '100%')};
    height: ${p => cvt(p.$height || 'auto')};
    background-color: ${p => cvt(p.$background || 'transparent')};
    flex-direction: ${p => p.$direction || 'row'};
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
    $scrollX?: boolean;
    $gap?: string;
    $rounded?: string;
}>`
    display: flex;
    flex-direction: column;
    gap: ${p => cvt(p.$gap || '')};
    justify-content: ${p => (!p.$scroll && p.$center ? 'center' : 'flex-start')};
    align-items: ${p => (p.$center ? 'center' : 'flex-start')};
    background-color: ${p => cvt(p.$background || 'transparent')};
    overflow-y: ${p => (p.$scroll ? 'auto' : 'hidden')};
    overflow-x: ${p => (p.$scrollX ? 'auto' : 'hidden')};
    border-radius: ${p => cvt(p.$rounded || '')};
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    flex: 1;
`;

const Overlay = styled(Container)<{
    $color?: string;
    $opacity?: number;
}>`
    position: absolute;
    top: 0;
    left: 0;
    background-color: ${p => cvt(p.$color || 'transparent')};
    opacity: ${p => cvt(p.$opacity || 1)};
`;

type FloatPosition = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';

const Float = styled(Div)<{
    $position?: FloatPosition;
    $distance?: string;
} & ISizeMixin>`
    ${sizeMixin}
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
    $align?: 'left' | 'right' | 'center';
    $transform?: 'uppercase' | 'lowercase' | 'capitalize';
} & ISizeMixin>`
    ${sizeMixin}
    font-size: ${p => cvt(p.$size || 'body')};
    font-weight: ${p => cvt(p.$weight || '400')};
    text-align: ${p => p.$align || ""};
    text-transform: ${p => p.$transform || 'none'};
`;

export {
    Div,
    Link,
    Button,
    Input,
    Select,
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
