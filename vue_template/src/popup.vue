<template>
  <div>
    <nav>
      <div class="nav-wrapper">
        <span href="#" class="brand-logo">Presence</span>
        <ul id="nav-mobile" class="right">
          <li>
            <a href="#" id="refresh_link">
              <i class="material-icons" v-on:click.prevent="refreshStatus">refresh</i>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="row" v-if="healthy">
      <ul class="col s12 collection">
        <li
          class="collection-item avatar"
          v-for="user in users"
          v-bind:title="user.title"
          v-bind:key="user.id"
        >
          <i class="material-icons circle" v-bind:class="user.presence_color">person</i>
          <span class="title">{{ user.displayName }}</span>
          <p>{{ user.mail }}</p>
        </li>
      </ul>
    </div>
    <div v-else class="row">
      <div class="col s12">
        <p>Error occurred.</p>
        <p>Open options page and check the settings.</p>
        <div>
          <a
            class="waves-effect waves-light btn"
            id="open_options"
            v-on:click.prevent="openOptions"
          >
            Options
            <i class="material-icons right">settings</i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      healthy: true,
      users: []
    };
  },
  methods: {
    refreshStatus: function() {
      window.TeamsPresenceChecker.refreshStatus(this);
    },

    openOptions: function() {
      window.TeamsPresenceChecker.openOptions();
    }
  },
  created: function() {
    this.refreshStatus();
  }
};
</script>

<style scoped>
nav {
  min-width: 350px;
  padding-left: 2em;
  padding-right: 2em;
}

.collection .collection-item.avatar {
  min-height: max-content;
}
</style>
