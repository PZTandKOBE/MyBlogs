fullText:
<template>
  <div class="main">
    <div class="currentplaying">
      <svg height="50px" width="50px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="spotify">
        <radialGradient gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -534)" r="43.888" cy="572.064"
          cx="33.34" id="ipdIa4~cOclR8yt_ClW93a">
          <stop stop-color="#f4e9c3" offset="0"></stop>
          <stop stop-color="#f8eecd" offset=".219"></stop>
          <stop stop-color="#fdf4dc" offset=".644"></stop>
          <stop stop-color="#fff6e1" offset="1"></stop>
        </radialGradient>
        <linearGradient gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -534)" y2="590.253" y1="530.096"
          x2="32" x1="32" id="ipdIa4~cOclR8yt_ClW93b">
          <stop stop-color="#42d778" offset="0"></stop>
          <stop stop-color="#3dca76" offset=".428"></stop>
          <stop stop-color="#34b171" offset="1"></stop>
        </linearGradient>
        <path
          d="M57,32c0,12.837-9.663,23.404-22.115,24.837C33.942,56.942,32.971,57,32,57	c-1.644,0-3.25-0.163-4.808-0.471C15.683,54.298,7,44.163,7,32C7,18.192,18.192,7,32,7S57,18.192,57,32z"
          fill="url(#ipdIa4~cOclR8yt_ClW93b)"></path>
        <path
          d="M41.683,44.394c-0.365,0-0.731-0.181-1.096-0.365c-3.471-2.009-7.674-3.105-12.24-3.105	c-2.559,0-5.116,0.364-7.491,0.912c-0.365,0-0.914,0.183-1.096,0.183c-0.914,0-1.461-0.732-1.461-1.462	c0-0.913,0.547-1.463,1.279-1.643c2.923-0.732,5.846-1.096,8.951-1.096c5.116,0,9.866,1.276,13.885,3.655	c0.548,0.364,0.914,0.73,0.914,1.642C43.145,43.847,42.414,44.394,41.683,44.394z M44.241,38.181c-0.547,0-0.912-0.18-1.279-0.364	c-3.835-2.375-9.135-3.839-15.163-3.839c-2.924,0-5.664,0.366-7.674,0.916c-0.549,0.18-0.731,0.18-1.096,0.18	c-1.096,0-1.827-0.912-1.827-1.826c0-1.096,0.549-1.645,1.461-2.009c2.74-0.73,5.481-1.279,9.317-1.279	c6.213,0,12.241,1.463,16.991,4.384c0.73,0.364,1.096,1.096,1.096,1.826C46.069,37.269,45.337,38.181,44.241,38.181z M47.165,30.876	c-0.548,0-0.731-0.182-1.279-0.364c-4.385-2.559-10.961-4.021-17.356-4.021c-3.289,0-6.577,0.366-9.5,1.096	c-0.366,0-0.731,0.182-1.279,0.182c-1.279,0.183-2.193-0.912-2.193-2.192c0-1.279,0.731-2.009,1.644-2.192	c3.471-1.096,7.125-1.462,11.327-1.462c6.943,0,14.25,1.462,19.731,4.567c0.73,0.366,1.278,1.096,1.278,2.193	C49.357,29.961,48.442,30.876,47.165,30.876z"
          fill="#fff"></path>
      </svg>
      <h1 class="heading">我喜爱的歌曲</h1>
    </div>
    
    <div 
      class="loader" 
      v-for="song in musicList" 
      :key="song.id"
      @click="togglePlay(song)"
      :class="{ 'active-song': currentPlayingId === song.id }"
    >
      <div class="song">
        <p class="name">{{ song.name }}</p>
        <p class="artist">{{ song.artist }}</p>
      </div>
      
      <div 
        class="albumcover" 
        :style="song.cover ? `background-image: url(${song.cover}); background-size: cover; background-position: center;` : ''"
      ></div>
      
      <div class="loading" v-if="currentPlayingId === song.id && isPlaying">
        <div class="load"></div>
        <div class="load"></div>
        <div class="load"></div>
        <div class="load"></div>
      </div>
      <div class="play" v-else></div>
    </div>

    <Transition name="slide-fade">
      <div class="player-controls" v-if="currentPlayingId !== null && isPlaying">
        <div class="progress-container">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <input 
            type="range" 
            class="slider progress-bar" 
            min="0" 
            :max="duration || 0" 
            :value="currentTime" 
            @input="onSeek"
          >
          <span class="time">{{ formatTime(duration) }}</span>
        </div>
        
        <div class="volume-container">
          <svg fill="#f1f1f1" viewBox="0 0 24 24" width="16px" height="16px">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input 
            type="range" 
            class="slider volume-bar" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="volume" 
            @input="onVolumeChange"
          >
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getMusicListApi } from '@/api/media';

interface Song {
  id: number | string;
  name: string;
  artist: string;
  cover: string;
  url: string;
}

const musicList = ref<Song[]>([]);
const currentPlayingId = ref<number | string | null>(null);
const isPlaying = ref(false);

const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.7); // 默认音量

const audioPlayer = new Audio();
audioPlayer.volume = volume.value;

audioPlayer.onended = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};

audioPlayer.ontimeupdate = () => {
  currentTime.value = audioPlayer.currentTime;
};

audioPlayer.onloadedmetadata = () => {
  duration.value = audioPlayer.duration;
};

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '00:00';
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = Math.floor(time % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const onSeek = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const time = Number(target.value);
  audioPlayer.currentTime = time;
  currentTime.value = time;
};

const onVolumeChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const vol = Number(target.value);
  audioPlayer.volume = vol;
};

const fallbackMusic: Song[] = [
  { 
    id: 1, 
    name: 'Bound 2', 
    artist: 'Kanye West', 
    cover: '',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=empty-mind-118973.mp3'
  }
];

const useFallbackData = () => {
  musicList.value = fallbackMusic;
};

const togglePlay = (song: Song) => {
  if (!song.url) {
    alert('暂无该歌曲的音频资源！');
    return;
  }

  if (currentPlayingId.value === song.id) {
    if (isPlaying.value) {
      audioPlayer.pause();
      isPlaying.value = false;
    } else {
      audioPlayer.play().catch(err => console.error('播放失败:', err));
      isPlaying.value = true;
    }
  } else {
    audioPlayer.src = song.url;
    audioPlayer.play().catch(err => console.error('播放失败:', err));
    currentPlayingId.value = song.id;
    isPlaying.value = true;
  }
};

const fetchMusicData = async () => {
  try {
    const res = await getMusicListApi();
    const responseData = res.data && res.data.code ? res.data : res;
    
    if (responseData.code === 200 && Array.isArray(responseData.data) && responseData.data.length > 0) {
      musicList.value = responseData.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artist,
        cover: item.coverUrl || '',
        url: item.url ? item.url.trim() : ''
      }));
    } else {
      useFallbackData();
    }
  } catch (error) {
    console.error('获取音乐列表失败:', error);
    useFallbackData();
  }
};

onMounted(() => {
  fetchMusicData();
});

onBeforeUnmount(() => {
  audioPlayer.pause();
  audioPlayer.src = '';
});
</script>

<style scoped>
.main {
  background-color: #1a1a1a;
  padding: 1em;
  padding-bottom: 1.1em;
  border-radius: 15px;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);
  margin: 1em;
  overflow: hidden; /* 关键：确保控制台收起时不会撑破外容器 */
}

.loader {
  display: flex;
  flex-direction: row;
  height: 5em;
  padding-left: 1em;
  padding-right: 1em;
  transform: rotate(180deg); /* 这是整体卡片反转180° */
  justify-content: right;
  border-radius: 10px;
  transition: .4s ease-in-out;
}

.loader:hover {
  cursor: pointer;
  background-color: #2a2a2a;
}

.active-song {
  background-color: #2a2a2a;
}

.currentplaying {
  display: flex;
  margin: 1em;
}

.spotify {
  width: 50px;
  height: 50px;
  margin-right: 0.6em;
}

.heading {
  color: #f1f1f1;
  font-size: 1.1em;
  font-weight: bold;
  align-self: center;
}

.loading {
  display: flex;
  margin-top: 1em;
  margin-left: 0.3em;
}

.load {
  width: 2px;
  height: 33px;
  background-color: limegreen;
  animation: 1s move6 infinite;
  border-radius: 5px;
  margin: 0.1em;
}

.load:nth-child(1) { animation-delay: 0.2s; }
.load:nth-child(2) { animation-delay: 0.4s; }
.load:nth-child(3) { animation-delay: 0.6s; }

.play {
  position: relative;
  /* position: right; */ /* 这个属性是非法的，删掉了 */
  height: 1.6em;
  width: 1.6em;
  
  /* --- 修正：更标准的播放三角形 clip-path 样式 --- */
  clip-path: polygon(15% 5%, 15% 95%, 95% 50%);
  background-color: #f1f1f1;
  
  /* --- 新增修正：负负得正，让播放按钮正过来并且指向右侧 --- */
  transform: rotate(180deg);
  
  align-self: center;
  margin-top: 0.7em; /* 保持原有的位置偏移，也可以微调 */
  justify-self: center;
}

.albumcover {
  position: relative;
  margin-right: 1em;
  height: 40px;
  width: 40px;
  background-color: #3a3a3a;
  align-self: center;
  border-radius: 5px;
  
  /* --- 关键修正：负负得正，把图片正过来！！！ --- */
  transform: rotate(180deg);
}

.song {
  position: relative;
  transform: rotate(180deg); /* 文字已经是正的了，不用动 */
  margin-right: 1em;
  color: #f1f1f1;
  align-self: center;
}

.artist {
  font-size: 0.6em;
}

@keyframes move6 {
  0% { height: 0.2em; }
  25% { height: 0.7em; }
  50% { height: 1.5em; }
  100% { height: 0.2em; }
}

.player-controls {
  margin-top: 1.5em;
  padding-top: 1em;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-container, .volume-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.volume-container {
  justify-content: flex-end;
  padding-right: 0.5em;
}

.time {
  color: #888;
  font-size: 0.75em;
  min-width: 40px;
  text-align: center;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #333;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.slider:hover { background: #444; }

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: limegreen;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: limegreen;
  cursor: pointer;
  border: none;
}

.volume-bar { width: 80px; }

/* --- 过渡动画样式 --- */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>