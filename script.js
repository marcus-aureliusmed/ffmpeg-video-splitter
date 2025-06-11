import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
const splitButton = document.getElementById('split-button');
let videoFile = null;

// Initialize FFmpeg
async function init() {
  await ffmpeg.load();
  console.log("FFmpeg ready");
}

// Handle file upload
document.getElementById('video-upload').addEventListener('change', (e) => {
  videoFile = e.target.files[0];
});

// Split video into clips
splitButton.addEventListener('click', async () => {
  if (!videoFile) return alert("Upload a video first!");
  
  splitButton.disabled = true;
  const duration = parseInt(document.getElementById('clip-duration').value);
  
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  
  // Get video duration (simplified)
  const { duration: videoDuration } = await getVideoInfo();
  const totalClips = Math.ceil(videoDuration / duration);
  
  // Process each clip
  for (let i = 0; i < totalClips; i++) {
    const start = i * duration;
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', `${start}`,
      '-t', `${duration}`,
      '-c', 'copy',
      `clip_${i+1}.mp4`
    ]);
    
    const data = await ffmpeg.readFile(`clip_${i+1}.mp4`);
    downloadBlob(new Blob([data]), `clip_${i+1}.mp4`);
  }
  
  splitButton.disabled = false;
});

// Helper: Download blob
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// Helper: Get video metadata (simplified)
async function getVideoInfo() {
  return { duration: 180 }; // Replace with actual FFmpeg duration parsing
}

// Initialize
init();
