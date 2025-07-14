import React from 'react';
import PropTypes from 'prop-types';

function Button({ children, onClick, variant = 'default', disabled = false }) {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '5px',
  };

  const variants = {
    default: {
      backgroundColor: '#e0e0e0',
      color: '#333',
    },
    primary: {
      backgroundColor: '#61dafb',
      color: '#282c34',
    },
    // Add more variants as needed
  };

  const style = {
    ...baseStyle,
    ...(variants[variant] || variants.default),
    ...(disabled && { opacity: 0.5, cursor: 'not-allowed' }),
  };

  return (
    <button onClick={onClick} style={style} disabled={disabled} className={variant}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'primary']), // Define allowed variants
  disabled: PropTypes.bool,
};

export default Button;