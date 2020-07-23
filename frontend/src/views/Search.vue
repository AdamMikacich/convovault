<template>
  <div id="search" class="center column">
    <div class="container">
      <div class="row">
        <input type="text" placeholder="Search..." v-model="inputs.search">
        <button class="primary" @click="search">Search</button>
        <button @click="inputs.search = ''">Clear</button>
      </div>
      <div
        class="assets"
        v-if="view === true"
      >
        <ul>
          <h1>Asset Viewer</h1>
          <h3 @click="close">Close</h3>
          <li
            v-for="asset in assets"
            :key="asset.id"
          >
            <h2 @click="download(asset)">{{ asset.name }}</h2>
          </li>
        </ul>
      </div>
      <ul v-if="results !== null && results.length > 0">
        <li
          class="row"
          v-for="message in results"
          :key="message.id"
        >
          <!--<img src="https://via.placeholder.com/50">-->
          <div class="column">
            <h1>{{ message.user.real_name }} ({{ message.user.name }})<span> &#183; {{ message.createdAt }}</span></h1>
            <p>{{ message.content }}</p>
            <h2 @click="open(message.assets)">View {{ message.assets.length }} Asset{{ message.assets.length === 1 ? '' : 's' }}</h2>
          </div>
        </li>
      </ul>
      <ul v-else-if="results !== null">
        <h3>No Results</h3>
      </ul>
      <ul v-else>
        <h3>Expired Session (please run /vault again)</h3>
      </ul>
    </div>
  </div>
</template>

<script>
import config from '@/config/data.json';

export default {
  name: 'Search',
  data() {
    return {
      results: [],
      inputs: {
        search: ''
      },
      view: false,
      assets: []
    }
  },
  mounted() {
    this.search();
  },
  watch: {
    'inputs.search': function() {
      this.search();
    }
  },
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

      let url = `${config.paths.convovault}/query?session=${session}`;
      if (this.inputs.search.length > 0) url += `&search=${this.inputs.search}`;
      let results = await this.request(url);
      results = JSON.parse(results);

      if (results[0] === null) {
        this.results = null;
        return;
      }
      this.results = results.map((message) => {
        message.createdAt = new Date(message.createdAt).toLocaleString();
        return message;
      });
    },
    async open(ids) {
      const { session } = this.$route.query;

      if (ids.length === 0) return;
      this.view = true;
      let url = `${config.paths.convovault}/assets?session=${session}`;
      url += `&ids=${ids.join(',')}`;
      let results = await this.request(url);
      results = JSON.parse(results);

      console.log(results);

      if (results[0] === null) return;
      this.assets = results;
    },
    close() {
      this.view = false;
      this.assets = [];
    },
    download(asset) {
      const { session } = this.$route.query;

      let url = `${config.paths.convovault}/download?session=${session}`;
      url += `&id=${asset.id}`;
      window.location.href = url;
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

.assets {
  margin: 20px;
  z-index: 10;
  position: absolute;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  max-width: 960px;
  width: calc(100vw - 140px);
}

.assets h3 {
  font-weight: normal;
  cursor: pointer;
  margin-top: 10px;
}

.assets li {
  min-height: 0;
  font-size: 1em;
}
</style>