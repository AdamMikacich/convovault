<template>
  <div id="search" class="center column">
    <div class="container">
      <div class="row">
        <input type="text" placeholder="Search...">
        <button class="primary" @click="search">Search</button>
        <button>Add Filters</button>
      </div>
      <ul>
        <li class="row">
          <!--<img src="https://via.placeholder.com/50">-->
          <div class="column">
            <h1>Full Name<span> &#183; Time 7:30AM Yesterday</span></h1>
            <p>Test message content here</p>
            <h2>View 3 Assets</h2>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import config from '@/config/data.json';

export default {
  name: 'Search',
  methods: {
    async request(url) {
      return new Promise((resolve) => {
        const http = new XMLHttpRequest();
        http.onreadystatechange = function() { 
          if (http.readyState == 4 && http.status == 200) {
            return resolve(http.responseText)
          }
        };

        http.open('GET', url, true);            
        http.send(null);
      })
    },
    async search() {
      const { session } = this.$route.query;
      const result = await this.request(`${config.paths.convovault}/query?session=${session}`);
      console.log(result);
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  margin-top: 40px;
  max-width: 1000px;
  width: calc(100vw - 100px);
}

input, button {
  box-shadow: 0 0 10px rgba(18, 21, 25, 0.05);
  border: none;
  outline: none;
  height: 50px;
}

input {
  padding: 15px 30px;
  background: white;
  border-radius: 5px;
  max-width: 1000px;
  width: calc(100% - 220px);
  margin-bottom: 20px;
}

button {
  cursor: pointer;
  background: #828DAB;
  border-radius: 5px;
  width: 100px;
  margin-left: 10px;
  border: none;
  color: white;
}

button.primary {
  background: #448deb;
}

ul {
  padding: 40px;
  background: white;
  border-radius: 5px;
  width: 100%;
  box-shadow: 0 0 10px rgba(18, 21, 25, 0.05);
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
  width: 50px;
  height: 50px;
  margin-right: 15px;
  border-radius: 50%;
  background: #828DAB;
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