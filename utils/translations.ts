export type LanguageType = 'en' | 'km';

export const translations = {
  en: {
    appName: 'YouTube Downloader',
    home: 'Home',
    history: 'History',
    settings: 'Settings',
    tagline: 'Download YouTube Videos & Audio Instantly',
    description: 'Paste a video link or drag-and-drop to download in high quality MP4 or MP3 formats.',
    pastePlaceholder: 'Paste YouTube video link here... (e.g. https://youtube.com/watch?v=...)',
    dragDropText: 'Or drag and drop a YouTube link here',
    analyzeBtn: 'Fetch Details',
    analyzing: 'Analyzing Video...',
    invalidUrl: 'Please enter a valid YouTube video URL.',
    errorFetching: 'Failed to retrieve video information. Make sure the video is public and accessible.',
    
    // Video Details
    videoDetails: 'Video Details',
    channel: 'Channel',
    duration: 'Duration',
    views: 'Views',
    copyInfo: 'Copy Info',
    infoCopied: 'Video information copied to clipboard!',
    videoFormats: 'Video Formats (MP4)',
    audioFormats: 'Audio Formats (MP3)',
    resolution: 'Resolution',
    bitrate: 'Bitrate',
    fileSize: 'File Size',
    downloadBtn: 'Download',
    downloadingBtn: 'Downloading...',
    
    // Download Manager / History
    downloadManager: 'Download Manager',
    recentDownloads: 'Recent Downloads',
    noHistory: 'No download history found. Start downloading now!',
    colVideo: 'Video / Audio',
    colSize: 'Size',
    colStatus: 'Status',
    colProgress: 'Progress',
    colSpeed: 'Speed',
    colActions: 'Actions',
    
    statusPending: 'Pending',
    statusDownloading: 'Downloading',
    statusCompleted: 'Completed',
    statusFailed: 'Failed',
    statusCancelled: 'Cancelled',
    
    actionCancel: 'Cancel',
    actionDelete: 'Delete',
    actionDownloadFile: 'Save to Device',
    
    // Settings & Diagnostics
    appSettings: 'Application Settings',
    uiLanguage: 'Interface Language',
    uiTheme: 'Color Theme',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    envDiagnostics: 'Environment Diagnostics',
    pythonStatus: 'Python 3.9+ Status',
    ffmpegStatus: 'FFmpeg Status',
    statusInstalled: 'Installed / Available',
    statusMissing: 'Missing / Not Found',
    diagnosticsDesc: 'Ensure both Python and FFmpeg are installed for full capabilities (high-quality merges and conversion).',
    
    // Legal & Disclaimer
    disclaimerTitle: 'Disclaimer & Terms of Service',
    disclaimerText: 'This application is built for educational purposes. It should only be used to download videos for which you have explicit permission or copyright ownership. Downloading copyrighted content without authorization violates YouTube\'s Terms of Service and local laws. Use this tool responsibly.',
    acceptDisclaimer: 'I understand and agree to the terms',
    footerLegal: 'Respect creators. Only download content with permission.'
  },
  km: {
    appName: 'ទាញយកវីដេអូ YouTube',
    home: 'ទំព័រដើម',
    history: 'ប្រវត្តិទាញយក',
    settings: 'ការកំណត់',
    tagline: 'ទាញយកវីដេអូ និងសំឡេងពី YouTube ភ្លាមៗ',
    description: 'បិទភ្ជាប់តំណភ្ជាប់វីដេអូ ឬអូសទម្លាក់ដើម្បីទាញយកក្នុងទម្រង់ MP4 ឬ MP3 ដែលមានគុណភាពខ្ពស់។',
    pastePlaceholder: 'បិទភ្ជាប់តំណភ្ជាប់វីដេអូ YouTube នៅទីនេះ... (ឧទាហរណ៍ https://youtube.com/watch?v=...)',
    dragDropText: 'ឬអូសនិងទម្លាក់តំណភ្ជាប់ YouTube នៅទីនេះ',
    analyzeBtn: 'ទាញយកព័ត៌មាន',
    analyzing: 'កំពុងវិភាគវីដេអូ...',
    invalidUrl: 'សូមបញ្ចូលតំណភ្ជាប់វីដេអូ YouTube ឲ្យបានត្រឹមត្រូវ។',
    errorFetching: 'មិនអាចទាញយកព័ត៌មានវីដេអូបានទេ។ សូមប្រាកដថាវីដេអូនោះជាវីដេអូសាធារណៈ និងអាចចូលមើលបាន។',
    
    // Video Details
    videoDetails: 'ព័ត៌មានលម្អិតនៃវីដេអូ',
    channel: 'ឆានែល',
    duration: 'រយៈពេល',
    views: 'ចំនួនទស្សនា',
    copyInfo: 'ចម្លងព័ត៌មាន',
    infoCopied: 'បានចម្លងព័ត៌មានវីដេអូទៅកាន់ clipboard រួចរាល់!',
    videoFormats: 'ទម្រង់វីដេអូ (MP4)',
    audioFormats: 'ទម្រង់សំឡេង (MP3)',
    resolution: 'កម្រិតភាពច្បាស់',
    bitrate: 'កម្រិតសំឡេង (Bitrate)',
    fileSize: 'ទំហំឯកសារ',
    downloadBtn: 'ទាញយក',
    downloadingBtn: 'កំពុងទាញយក...',
    
    // Download Manager / History
    downloadManager: 'កម្មវិធីគ្រប់គ្រងការទាញយក',
    recentDownloads: 'ការទាញយកថ្មីៗ',
    noHistory: 'មិនទាន់មានប្រវត្តិទាញយកនៅឡើយទេ។ ចាប់ផ្តើមទាញយកឥឡូវនេះ!',
    colVideo: 'វីដេអូ / សំឡេង',
    colSize: 'ទំហំ',
    colStatus: 'ស្ថានភាព',
    colProgress: 'វឌ្ឍនភាព',
    colSpeed: 'ល្បឿន',
    colActions: 'សកម្មភាព',
    
    statusPending: 'រង់ចាំ',
    statusDownloading: 'កំពុងទាញយក',
    statusCompleted: 'ជោគជ័យ',
    statusFailed: 'បរាជ័យ',
    statusCancelled: 'បានបោះបង់',
    
    actionCancel: 'បោះបង់',
    actionDelete: 'លុបចេញ',
    actionDownloadFile: 'រក្សាទុកក្នុងឧបករណ៍',
    
    // Settings & Diagnostics
    appSettings: 'ការកំណត់កម្មវិធី',
    uiLanguage: 'ភាសាកម្មវិធី',
    uiTheme: 'រូបរាងកម្មវិធី',
    themeDark: 'រចនាបថងងឹត (Dark Mode)',
    themeLight: 'រចនាបថភ្លឺ (Light Mode)',
    envDiagnostics: 'ការពិនិត្យប្រព័ន្ធដំណើរការ',
    pythonStatus: 'ស្ថានភាព Python 3.9+',
    ffmpegStatus: 'ស្ថានភាព FFmpeg',
    statusInstalled: 'បានដំឡើង / មានស្រាប់',
    statusMissing: 'មិនទាន់ដំឡើង / មិនមាន',
    diagnosticsDesc: 'សូមប្រាកដថាបានដំឡើងទាំង Python និង FFmpeg ដើម្បីប្រើប្រាស់សមត្ថភាពពេញលេញ (ការបញ្ចូលវីដេអូគុណភាពខ្ពស់ និងការបំលែងឯកសារ)។',
    
    // Legal & Disclaimer
    disclaimerTitle: 'ការបដិសេធ និងលក្ខខណ្ឌប្រើប្រាស់',
    disclaimerText: 'កម្មវិធីនេះត្រូវបានបង្កើតឡើងសម្រាប់គោលបំណងសិក្សាតែប៉ុណ្ណោះ។ វាគួរតែត្រូវបានប្រើដើម្បីទាញយកវីដេអូដែលអ្នកមានការអនុញ្ញាតច្បាស់លាស់ ឬមានសិទ្ធិជាម្ចាស់កម្មសិទ្ធិបញ្ញា។ ការទាញយកមាតិកាដែលមានកម្មសិទ្ធិបញ្ញាដោយគ្មានការអនុញ្ញាត គឺរំលោភលើលក្ខខណ្ឌសេវាកម្មរបស់ YouTube និងច្បាប់ក្នុងតំបន់។ សូមប្រើប្រាស់ឧបករណ៍នេះដោយការទទួលខុសត្រូវ។',
    acceptDisclaimer: 'ខ្ញុំយល់ព្រម និងយល់ស្របនឹងលក្ខខណ្ឌ',
    footerLegal: 'គោរពអ្នកបង្កើតមាតិកា។ ទាញយកតែមាតិកាដែលមានការអនុញ្ញាត។'
  }
};
