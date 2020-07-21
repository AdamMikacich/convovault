<template>
  <div id="search" class="center">
    <ul>
      <li class="row">
        <img src="https://via.placeholder.com/50">
        <div class="column">
          <h1>Full Name<span> &#183; Time 7:30AM Yesterday</span></h1>
          <p>Test message content here</p>
          <h2>View 3 Assets</h2>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Search'
}
</script>

<style scoped lang="scss">
ul {
  margin-top: 50px;
  padding: 40px;
  background: white;
  border-radius: 5px;
  max-width: 1000px;
  width: calc(100vw - 100px);
  box-shadow: 0 0 20px rgba(18, 21, 25, 0.1);
}

li {
  min-height: 70px;
  width: 100%;
  background: white;
  text-align: left;
}

li:not(:first-child) {
  margin-top: 20px;
}

li img {
  height: 50px;
  margin-right: 15px;
  border-radius: 50%;
}

li h1 {
  font-size: 1em;
}

li h1 span {
  font-weight: normal;
  color: #ADB6D0;
}

li p {
  margin-top: 5px;
  font-size: 1em;
}

li h2 {
  margin-top: 5px;
  font-weight: normal;
  font-size: 0.9em;
  color: #448deb;
  cursor: pointer;
}
</style>