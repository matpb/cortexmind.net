import updateInfo from '../../update-v2.json';

export const version: string = updateInfo.version;
export const pubDate: string = updateInfo.pub_date;

const BASE = `https://github.com/matpb/cortexmind.net/releases/download/v${version}`;

export const macUrl = `${BASE}/CortexMind_${version}_aarch64.dmg`;
export const windowsUrl = `${BASE}/CortexMind_${version}_x64-setup.exe`;
export const linuxUrl = `${BASE}/CortexMind.AppImage`;

export const downloads = {
  version,
  pub_date: pubDate,
  platforms: {
    macos_apple_silicon: { url: macUrl, format: 'dmg' },
    windows_x64: { url: windowsUrl, format: 'exe' },
    linux_x64: { url: linuxUrl, format: 'appimage' }
  }
};
