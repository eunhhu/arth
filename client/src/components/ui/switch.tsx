import React from 'react';
import styled from 'styled-components';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

const SwitchContainer = styled.label<{ size: string; disabled?: boolean }>`
    position: relative;
    display: inline-block;
    width: ${props => (props.size === 'small' ? '36px' : props.size === 'large' ? '60px' : '48px')};
    height: ${props => (props.size === 'small' ? '18px' : props.size === 'large' ? '30px' : '24px')};
    opacity: ${props => (props.disabled ? 0.6 : 1)};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const SwitchInput = styled.input`
    opacity: 0;
    width: 0;
    height: 0;
`;

const Slider = styled.span<{ checked: boolean; color: string; size: string }>`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => (props.checked ? props.color : '#ccc')};
    border-radius: 999px;
    transition: 0.3s;

    &::before {
        position: absolute;
        content: '';
        height: ${props => (props.size === 'small' ? '14px' : props.size === 'large' ? '26px' : '20px')};
        width: ${props => (props.size === 'small' ? '14px' : props.size === 'large' ? '26px' : '20px')};
        left: ${props => (props.checked ? (props.size === 'small' ? '20px' : props.size === 'large' ? '34px' : '24px') : '4px')};
        bottom: 2px;
        background-color: white;
        border-radius: 50%;
        transition: 0.3s;
    }
`;

const Switch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    disabled = false,
    size = 'medium',
    color = '#333',
}) => {
    const handleChange = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <SwitchContainer size={size} disabled={disabled}>
            <SwitchInput
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
            />
            <Slider checked={checked} color={color} size={size} />
        </SwitchContainer>
    );
};

export default Switch;
