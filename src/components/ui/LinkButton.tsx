import { Link, type LinkProps } from 'react-router-dom';
import { buttonClasses, type ButtonVariant, type ButtonSize } from './Button';

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function LinkButton({ variant = 'primary', size = 'md', fullWidth, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, { fullWidth, className })} {...props} />;
}
