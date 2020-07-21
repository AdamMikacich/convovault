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
body {
  margin: 0;
  background: #F8F9FD;
  color: #121519;
  width: 100vw;
  height: 100vh;
}

#app {
  text-align: center;
}

* {
  font-family: 'Sen', sans-serif, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  width: 600px;
  height: 250px;
  padding: 40px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 0 50px rgba(18, 21, 25, 0.2);
}
</style>
