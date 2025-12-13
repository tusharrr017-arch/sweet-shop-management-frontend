import logoImage from '../pages/Images/FullLogo_Transparent_NoBuffer.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

const Logo = ({ size = 'medium', showTagline = true }: LogoProps) => {
  const sizes = {
    small: { image: { desktop: 120, tablet: 100, mobile: 80 } },
    medium: { image: { desktop: 180, tablet: 150, mobile: 120 } },
    large: { image: { desktop: 250, tablet: 200, mobile: 150 } },
  };

  const currentSize = sizes[size];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      cursor: 'pointer'
    }}>
      {/* Logo Image */}
      <div style={{ 
        marginBottom: showTagline ? '12px' : '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src={logoImage}
          alt="The Sweet Studio Logo"
          style={{ 
            width: currentSize.image.desktop,
            height: 'auto',
            objectFit: 'contain',
            maxWidth: '100%'
          }}
          className="logo-responsive"
        />
      </div>
    </div>
  );
};

export default Logo;
