const youtubedl = require('youtube-dl-exec');

async function test() {
  console.log('Testing youtube-dl-exec metadata fetch...');
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    console.log('--- FETCH SUCCESS ---');
    console.log('Title:', info.title);
    console.log('Uploader/Channel:', info.uploader || info.channel);
    console.log('Duration:', info.duration, 'seconds');
    console.log('Available formats:', info.formats ? info.formats.length : 0);
    console.log('--- TEST PASSED ---');
  } catch (err) {
    console.error('--- FETCH FAILED ---');
    console.error(err);
    console.log('Make sure Python 3.9+ is installed and available in your system path.');
  }
}

test();
