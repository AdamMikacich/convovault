<template>
  <div id="app">
    <Nav></Nav>
    <router-view/>
  </div>
</template>

<script>
import Nav from '@/components/Nav';

export default {
  components: {
    Nav
  }
}
</script>

<style lang="scss">
#app {
  text-align: center;
}

* {
  font-family: 'Montserrat', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
