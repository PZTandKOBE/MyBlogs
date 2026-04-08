<script setup>
import { ref } from 'vue';
import { loginApi, registerApi } from '@/api/auth';
import AlertModal from '@/views/Error/index.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const isLoading = ref(false);
const alertVisible = ref(false);
const alertType = ref('success');
const alertTitle = ref('提示');
const alertMessage = ref('');
const pendingRedirect = ref(false);

const showAlert = ({ type = 'success', title = '提示', message = '' }) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;
};

const handleAlertConfirm = () => {
  if (pendingRedirect.value) {
    pendingRedirect.value = false;
    router.push('/home');
  }
};

const handleAlertCancel = () => {
  pendingRedirect.value = false;
};

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
});

// 注册表单数据 (新增 email 和 confirmPassword)
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// 邮箱正则校验
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 登录逻辑
const handleLogin = async () => {
  // 1. 格式校验
  if (!loginForm.value.username || loginForm.value.username.length < 3) {
    showAlert({ type: 'error', title: '格式错误', message: '用户名不能为空且不能少于3位' });
    return;
  }
  if (!loginForm.value.password || loginForm.value.password.length < 6) {
    showAlert({ type: 'error', title: '格式错误', message: '密码不能少于6位' });
    return;
  }

  try {
    isLoading.value = true;

    // 直接发送原始密码，依赖 HTTPS 保证传输安全
    const res = await loginApi({
      username: loginForm.value.username,
      password: loginForm.value.password
    });

    console.log('登录响应:', res);

    if (res && res.data) {
      localStorage.setItem('token', res.data);
      pendingRedirect.value = true;
      showAlert({
        type: 'success',
        title: '登录成功',
        message: '欢迎回来！'
      });
    } else {
      pendingRedirect.value = false;
      showAlert({
        type: 'error',
        title: '登录异常',
        message: '登录成功，但未获取到 Token'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    pendingRedirect.value = false;
    showAlert({
      type: 'error',
      title: '登录失败',
      message: '请检查账号密码或网络'
    });
  } finally {
    isLoading.value = false;
  }
};

// 注册逻辑
const handleRegister = async () => {
  // 1. 格式校验
  if (!registerForm.value.username || registerForm.value.username.length < 3) {
    showAlert({ type: 'error', title: '格式错误', message: '用户名不能为空且不能少于3位' });
    return;
  }
  if (!registerForm.value.email || !emailRegex.test(registerForm.value.email)) {
    showAlert({ type: 'error', title: '格式错误', message: '请输入有效的邮箱地址' });
    return;
  }
  if (!registerForm.value.password || registerForm.value.password.length < 6) {
    showAlert({ type: 'error', title: '格式错误', message: '密码不能少于6位' });
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showAlert({ type: 'error', title: '格式错误', message: '两次输入的密码不一致' });
    return;
  }

  try {
    isLoading.value = true;

    // 直接发送原始密码，依赖 HTTPS 保证传输安全
    const res = await registerApi({
      username: registerForm.value.username,
      email: registerForm.value.email, // 新增邮箱字段
      password: registerForm.value.password
    });

    console.log('注册响应:', res);
    pendingRedirect.value = false;
    showAlert({
      type: 'success',
      title: '注册成功',
      message: '请翻转卡片进行登录！'
    });
    // 注册成功后清理表单
    registerForm.value.username = '';
    registerForm.value.email = '';
    registerForm.value.password = '';
    registerForm.value.confirmPassword = '';
  } catch (error) {
    console.error('注册失败:', error);
    pendingRedirect.value = false;
    showAlert({
      type: 'error',
      title: '注册失败',
      message: '请稍后重试'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="wrapper">
    <div class="card-switch">
      <label class="switch">
        <input class="toggle" type="checkbox">
        <span class="slider"></span>
        <span class="card-side"></span>
        <div class="flip-card__inner">

          <div class="flip-card__front">
            <div class="title">Log in</div>
            <form class="flip-card__form" @submit.prevent="handleLogin">
              <input type="text" placeholder="Username (至少3位)" v-model="loginForm.username" class="flip-card__input">
              <input type="password" placeholder="Password (至少6位)" v-model="loginForm.password"
                class="flip-card__input">
              <button type="submit" class="flip-card__btn" :disabled="isLoading">Let`s go!</button>
            </form>
          </div>

          <div class="flip-card__back">
            <div class="title">Sign up</div>
            <form class="flip-card__form" @submit.prevent="handleRegister">
              <input type="text" placeholder="Username (至少3位)" v-model="registerForm.username" class="flip-card__input">
              <input type="email" placeholder="Email" v-model="registerForm.email" class="flip-card__input">
              <input type="password" placeholder="Password (至少6位)" v-model="registerForm.password"
                class="flip-card__input">
              <input type="password" placeholder="Confirm Password" v-model="registerForm.confirmPassword"
                class="flip-card__input">
              <button type="submit" class="flip-card__btn" :disabled="isLoading">Confirm!</button>
            </form>
          </div>

        </div>
      </label>
    </div>
    <AlertModal v-model:visible="alertVisible" :type="alertType" :title="alertTitle" :message="alertMessage"
      @confirm="handleAlertConfirm" @cancel="handleAlertCancel" />
  </div>
</template>

<style scoped>
.wrapper {
  --input-focus: #2d8cf0;
  --font-color: #fefefe;
  --font-color-sub: #7e7e7e;
  --bg-color: #111;
  --bg-color-alt: #7e7e7e;
  --main-color: #fefefe;
}

.switch {
  transform: translateY(-200px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  width: 50px;
  height: 20px;
}

.card-side::before {
  position: absolute;
  content: 'Log in';
  left: -70px;
  top: 0;
  width: 100px;
  text-decoration: underline;
  color: var(--font-color);
  font-weight: 600;
}

.card-side::after {
  position: absolute;
  content: 'Sign up';
  left: 70px;
  top: 0;
  width: 100px;
  text-decoration: none;
  color: var(--font-color);
  font-weight: 600;
}

.toggle {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  box-sizing: border-box;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  box-shadow: 4px 4px var(--main-color);
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-color);
  transition: 0.3s;
}

.slider:before {
  box-sizing: border-box;
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  border: 2px solid var(--main-color);
  border-radius: 5px;
  left: -2px;
  bottom: 2px;
  background-color: var(--bg-color);
  box-shadow: 0 3px 0 var(--main-color);
  transition: 0.3s;
}

.toggle:checked+.slider {
  background-color: var(--input-focus);
}

.toggle:checked+.slider:before {
  transform: translateX(30px);
}

.toggle:checked~.card-side:before {
  text-decoration: none;
}

.toggle:checked~.card-side:after {
  text-decoration: underline;
}

.flip-card__inner {
  width: 300px;
  height: 460px;
  /* 增加高度以容纳新增的两个输入框 */
  position: relative;
  background-color: transparent;
  perspective: 1000px;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.toggle:checked~.flip-card__inner {
  transform: rotateY(180deg);
}

.toggle:checked~.flip-card__front {
  box-shadow: none;
}

.flip-card__front,
.flip-card__back {
  padding: 20px;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  background: var(--bg-color);
  gap: 20px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  box-shadow: 4px 4px var(--main-color);
}

.flip-card__back {
  width: 100%;
  transform: rotateY(180deg);
}

.flip-card__form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.title {
  margin: 10px 0 20px 0;
  font-size: 25px;
  font-weight: 900;
  text-align: center;
  color: var(--main-color);
}

.flip-card__input {
  width: 250px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
  padding: 5px 10px;
  outline: none;
}

.flip-card__input::placeholder {
  color: var(--font-color-sub);
  opacity: 0.8;
}

.flip-card__input:focus {
  border: 2px solid var(--input-focus);
}

.flip-card__btn:active,
.button-confirm:active {
  box-shadow: 0px 0px var(--main-color);
  transform: translate(3px, 3px);
}

.flip-card__btn {
  margin: 10px 0 10px 0;
  width: 120px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 17px;
  font-weight: 600;
  color: var(--font-color);
  cursor: pointer;
}

.flip-card__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>