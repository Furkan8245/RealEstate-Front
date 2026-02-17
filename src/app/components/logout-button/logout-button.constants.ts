// logout-button.constants.ts

export interface ButtonState {
  '--figure-duration'?: string;
  '--walking-duration'?: string;
  '--transform-figure'?: string;
  '--transform-arm1'?: string;
  '--transform-wrist1'?: string;
  '--transform-arm2'?: string;
  '--transform-wrist2'?: string;
  '--transform-leg1'?: string;
  '--transform-calf1'?: string;
  '--transform-leg2'?: string;
  '--transform-calf2'?: string;
}

// Buradaki any kullanımına dikkat, tip olarak tanımlıyoruz
export const LOGOUT_BUTTON_STATES: Record<string, ButtonState> = {
  default: {
    '--figure-duration': '100',
    '--walking-duration': '100',
    '--transform-figure': 'none'
  },
  hover: {
    '--figure-duration': '100',
    '--walking-duration': '100',
    '--transform-figure': 'translateX(1.5px)'
  },
  walking1: { '--figure-duration': '300', '--walking-duration': '300' },
  walking2: { '--figure-duration': '400', '--walking-duration': '300' },
  falling1: { '--figure-duration': '1600', '--walking-duration': '400' },
  falling2: { '--figure-duration': '1000', '--walking-duration': '300' },
  falling3: { '--figure-duration': '1000', '--walking-duration': '500' }
};