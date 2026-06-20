'use client';

import { useRegisterDesktopTabHotkeys, useRegisterGlobalHotkeys } from '@/hooks/useHotkeys';

const RegisterHotkeys = () => {
  useRegisterGlobalHotkeys();
  useRegisterDesktopTabHotkeys();

  return null;
};

export default RegisterHotkeys;
