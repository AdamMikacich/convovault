<template>
  <div id="search" class="center column">
    <div class="container">
      <div class="row">
        <input type="text" placeholder="Search..." v-model="inputs.search">
        <button class="primary" @click="search">Search</button>
        <button @click="inputs.search = ''">Clear Query</button>
      </div>
      <div class="row dates">
        <datetime v-model="inputs.dateStart" :value-zone="timezone" placeholder="Start Date"></datetime>
        <datetime v-model="inputs.dateEnd" :value-zone="timezone" placeholder="End Date"></datetime>
        <button @click="inputs.dateStart = ''; inputs.dateEnd = '';">Clear Date</button>
      </div>
      <div class="row users">
        <select name="users" v-model="inputs.user">
          <option disabled selected value="">Any User</option>
          <option
            v-for="user of users"
            :key="'user' + user.user_id"
            :value="user.user_id"
          >
            {{ user.real_name }} ({{ user.name }})
          </option>
        </select>
        <button @click="inputs.user = ''">Clear User</button>
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
            <h2
              v-if="message.assets.length > 0"
              @click="open(message.assets)"
            >
              View {{ message.assets.length }} Asset{{ message.assets.length === 1 ? '' : 's' }}
            </h2>
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
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default {
  name: 'Search',
  components: {
    Datetime
  },
  data() {
    return {
      results: [],
      users: [],
      inputs: {
        search: '',
        dateStart: '',
        dateEnd: '',
        user: ''
      },
      view: false,
      assets: [],
      timezone
    }
  },
  mounted() {
    this.search();
    this.getUsers();
  },
  watch: {
    'inputs.search': function() {
      this.search();
    },
    'inputs.dateStart': function() {
      this.search();
    },
    'inputs.dateEnd': function() {
      this.search();
    },
    'inputs.user': function() {
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
    async getUsers() {
      const { session } = this.$route.query;

      let url = `${config.paths.convovault}/users?session=${session}`;
      let results = await this.request(url);
      results = JSON.parse(results);

      console.log(results);

      this.users = results;
    },
    async save(url) {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
    },
    async search() {
      const { session } = this.$route.query;

      let url = `${config.paths.convovault}/query?session=${session}`;
      if (this.inputs.search.length > 0) url += `&search=${this.inputs.search}`;
      url += `&datestart=${this.inputs.dateStart}`;
      url += `&dateend=${this.inputs.dateEnd}`;
      url += `&user=${this.inputs.user}`;
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

      if (results[0] === null) return;
      this.assets = results;
    },
    close() {
      this.view = false;
      this.assets = [];
    },
    async download(asset) {
      const { session } = this.$route.query;

      let url = `${config.paths.convovault}/assets/url?session=${session}`;
      url += `&id=${asset.id}`;
      
      let result = await this.request(url);

      if (result === null) {
        window.location.reload();
      } else {
        this.save(result);
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  margin-top: 40px;
  padding-bottom: 40px;
  max-width: 1000px;
  width: calc(100vw - 100px);
}

input, button, select {
  box-shadow: 0 0 10px rgba(18, 21, 25, 0.05);
  border: none;
  outline: none;
  height: 50px;
}

input, select {
  padding: 15px 30px;
  background: white;
  border-radius: 5px;
  max-width: 1000px;
  width: calc(100% - 220px);
  margin-bottom: 10px;
}

button {
  cursor: pointer;
  background: #828DAB;
  border-radius: 5px;
  width: 100px;
  min-width: 100px;
  margin-left: 10px;
  border: none;
  color: white;
}

button.primary {
  background: #448deb;
}

.row.dates {
  height: 50px;
  margin-bottom: 10px;
}

.row.dates .vdatetime {
  width: calc(50% - 5px);
}

.row.dates input {
  height: 50px;
  width: 100%;
}

.row.dates .vdatetime:first-child {
  margin-right: 10px;
}

.vdatetime-popup {
  border-radius: 5px;
  overflow: hidden;
}

.vdatetime-popup__header {
  background: #448deb;
}

.vdatetime-calendar__month__day--selected > span > span, .vdatetime-calendar__month__day--selected:hover > span > span {
  background: #448deb;
}

.vdatetime-popup__actions__button {
  color: #448deb;
}

.users select {
  width: 100%;
  color: #666;
  -webkit-appearance: none;
  -moz-appearance: none;
  text-indent: 0;
  text-overflow: '';
}

ul {
  padding: 40px;
  background: white;
  border-radius: 5px;
  width: 100%;
  box-shadow: 0 0 10px rgba(18, 21, 25, 0.05);
}

li {
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
  position: fixed;
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