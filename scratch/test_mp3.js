const url = 'https://youtu.be/VJgEx4iTnLU?si=ZeodR5tGxd2vgHe4';
const payload = {
  url,
  formatId: 'bestaudio',
  ext: 'mp3',
  title: 'Test Audio First Kiss',
  thumbnail: 'https://i.ytimg.com/vi/VJgEx4iTnLU/maxresdefault.jpg',
  channel: 'SmallWorld SmallBand',
  duration: 335,
  fileSize: 5488640,
  resolution: '128kbps'
};

async function run() {
  console.log('Sending MP3 download request...');
  const res = await fetch('http://localhost:3000/api/video/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log('Download queued:', data);
  
  if (!data.success) {
    console.error('Failed to queue download');
    return;
  }
  
  const id = data.id;
  console.log('Polling status for download ID:', id);
  
  const interval = setInterval(async () => {
    const historyRes = await fetch('http://localhost:3000/api/download/history');
    const history = await historyRes.json();
    const item = history.find(d => d.id === id);
    
    if (!item) {
      console.log('Download item not found in history yet...');
      return;
    }
    
    console.log(`Status: ${item.status} | Progress: ${item.progress}% | Speed: ${item.speed} | Error: ${item.error || 'none'}`);
    
    if (item.status === 'completed') {
      console.log('--- TEST PASSED: MP3 DOWNLOAD & FFmpeg CONVERSION COMPLETED ---');
      console.log('Saved file path:', item.file_path);
      clearInterval(interval);
      
      // Clean up
      console.log('Cleaning up test files...');
      await fetch(`http://localhost:3000/api/download/${id}`, { method: 'DELETE' });
      console.log('Cleaned up successfully!');
    } else if (item.status === 'failed' || item.status === 'cancelled') {
      console.error('--- TEST FAILED: MP3 DOWNLOAD DID NOT COMPLETE ---');
      clearInterval(interval);
    }
  }, 1000);
}

run().catch(console.error);
