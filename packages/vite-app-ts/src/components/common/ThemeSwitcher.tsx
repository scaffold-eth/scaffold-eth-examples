import { Switch } from 'antd';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useEffect, useState } from 'react';
import { useThemeSwitcher } from 'react-css-theme-switcher';

const initialTheme = window.localStorage.getItem('theme') ?? 'light';
export const ThemeSwitcher: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(initialTheme === 'dark');
  const { switcher, currentTheme, status, themes } = useThemeSwitcher();
  const ethersContext = useEthersContext();

  useEffect(() => {
    window.localStorage.setItem('theme', currentTheme ?? '');
    if (currentTheme === 'light' || currentTheme === 'dark') {
      ethersContext?.setModalTheme?.(currentTheme);
    }
  }, [currentTheme]);

  const toggleTheme = (isChecked: boolean): void => {
    setIsDarkMode(isChecked);
    switcher({ theme: isChecked ? themes.dark : themes.light });
    ethersContext?.setModalTheme?.(isDarkMode ? 'dark' : 'light');
  };

  if (status === 'loading' || status === 'idle') {
    return <></>;
  }

  return (
    <div className="main fade-in" style={{ position: 'fixed', right: 10, bottom: 10 }}>
      <span style={{ padding: 8 }}>{currentTheme === 'light' ? '☀️' : '🌜'}</span>
      <Switch checked={isDarkMode} onChange={toggleTheme} />
    </div>
  );

  return null;
};
