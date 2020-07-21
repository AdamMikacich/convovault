<template>
  <div id="home" class="center">
    <div class="modal center column">
      <p>Type <span>/vault</span> in any Slack channel to access the vault</p>
      <button @click="redirect">Try Now</button>
    </div>
  </div>
</template>

<script>
import config from '@/config/data.json';

export default {
  name: 'Home',
  methods: {
    redirect: function() {
      window.location.href = config.path;
    }
  }
}
</script>

<style scoped lang="scss">
#home {
  height: calc(100vh - 60px);
  width: 100vw;
}

p {
  font-size: 2em;
}

span {
  font-weight: bold;
}

button {
  cursor: pointer;
  padding: 15px 25px;
  font-size: 1em;
  border: none;
  outline: none;
  background: #335CFF;
  color: white;
  border-radius: 5px;
  margin-top: 20px;
}
</style>
