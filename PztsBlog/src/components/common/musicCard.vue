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
      
      <div class="loader">
        <div class="song">
          <p class="name">Bound 2</p>
          <p class="artist">Kanye West</p>
        </div>
        <div class="albumcover"></div>
        <div class="loading">
          <div class="load"></div>
          <div class="load"></div>
          <div class="load"></div>
          <div class="load"></div>
        </div>
      </div>
      
      <div class="loader">
        <div class="song">
          <p class="name">White Ferrari</p>
          <p class="artist">Frank Ocean</p>
        </div>
        <div class="albumcover"></div>
        <div class="play"></div>
      </div>
      
      <div class="loader">
        <div class="song">
          <p class="name">Flashing Lights</p>
          <p class="artist">Kanye West</p>
        </div>
        <div class="albumcover"></div>
        <div class="play"></div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .main {
    /* 1. 黑底：改为一个深灰色，增加高级简约感 */
    background-color: #1a1a1a;
    padding: 1em;
    padding-bottom: 1.1em;
    border-radius: 15px;
    /* 更细微、更深的阴影 */
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);
    margin: 1em;
  }
  
  .loader {
    display: flex;
    flex-direction: row;
    height: 5em;
    padding-left: 1em;
    padding-right: 1em;
    transform: rotate(180deg);
    justify-content: right;
    border-radius: 10px;
    transition: .4s ease-in-out;
  }
  
  .loader:hover {
    cursor: pointer;
    /* 2. 简约悬停：改为更深的灰色 */
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
    /* 1. 白卡：文本改为浅灰色 */
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
    /* 保留绿色，在深色背景上非常显眼 */
    background-color: limegreen;
    animation: 1s move6 infinite;
    border-radius: 5px;
    margin: 0.1em;
  }
  
  .load:nth-child(1) {
    animation-delay: 0.2s;
  }
  
  .load:nth-child(2) {
    animation-delay: 0.4s;
  }
  
  .load:nth-child(3) {
    animation-delay: 0.6s;
  }
  
  .play {
    position: relative;
    left: 0.35em;
    height: 1.6em;
    width: 1.6em;
    clip-path: polygon(50% 50%, 100% 50%, 75% 6.6%);
    /* 1. 白卡：播放按钮改为白色 */
    background-color: #f1f1f1;
    transform: rotate(-90deg);
    align-self: center;
    margin-top: 0.7em;
    justify-self: center;
  }
  
  .albumcover {
    position: relative;
    margin-right: 1em;
    height: 40px;
    width: 40px;
    /* 1. 黑底：封面占位符改为更深的灰色 */
    background-color: #3a3a3a;
    align-self: center;
    border-radius: 5px;
  }
  
  .song {
    position: relative;
    transform: rotate(180deg);
    margin-right: 1em;
    /* 1. 白卡：文本改为浅灰色 */
    color: #f1f1f1;
    align-self: center;
  }
  
  .artist {
    font-size: 0.6em;
  }
  
  @keyframes move6 {
    0% {
      height: 0.2em;
    }
  
    25% {
      height: 0.7em;
    }
  
    50% {
      height: 1.5em;
    }
  
    100% {
      height: 0.2em;
    }
  }
  </style>