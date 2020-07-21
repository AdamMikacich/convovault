<template>
  <div id="home" class="center">
    <div class="modal center">
      <p>Type <span>/vault</span> in any Slack channel to access the vault</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
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
</style>
