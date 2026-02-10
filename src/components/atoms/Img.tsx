import { ComponentProps, CSSProperties } from 'react';
import { cn } from '../../lib/utils';

interface ImgProps extends ComponentProps<'img'> {
  full?: boolean;
  fit?: CSSProperties['objectFit'];
}

const Img = ({ full, fit, className, style, ...props }: ImgProps) => {
  return (
    <img
      loading='lazy'
      className={cn(full && 'w-full', className)}
      style={{ objectFit: fit || 'contain', ...style }}
      {...props}
    />
  );
};

export default Img;
