import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelnote.app',
  appName: '旅行笔记',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http', // 改为http，解决混合内容问题
    cleartext: true,
    allowNavigation: ['*.travelnote.com', 'localhost:*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#ff2442"
    }
  }
};

export default config;
